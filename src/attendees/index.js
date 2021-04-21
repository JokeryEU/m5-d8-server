import express from "express";
import uniqid from "uniqid";
import multer from "multer";
import { check, validationResult } from "express-validator";
import { getAttendees, writeAttendees } from "../lib/fs-tools.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const projects = await getAttendees();
    const query = req.query.name;
    if (query) {
      const findProject = projects.find((proj) => proj.name === query);
      if (findProject) {
        res.status(200).send(findProject);
      } else {
        res.status(404).send("Not Found");
      }
    } else {
      res.status(200).send(projects);
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id", async (req, res) => {
  console.log("UNIQUE id: ", req.params.id);
  try {
    const projects = await getAttendees();

    const project = projects.find((project) => project.id === req.params.id);
    if (project) {
      res.status(200).send(project);
    } else {
      res.status(404).send("no project with that id");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post(
  "/",
  [
    check("name").exists().withMessage("name field is mandatory").trim(),
    check("description").exists().withMessage("field mandatory").trim(),
    check("repoUrl")
      .exists()
      .withMessage("field mandatory")
      .isURL()
      .withMessage("must be a valid url")
      .trim(),
    check("liveUrl").trim(),
    check("student_id").notEmpty().withMessage("provide student id").trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (errors.notEmpty()) {
        const students = await getStudents();
        const projects = await getProjects();
        const newProject = { ...req.body, id: uniqid(), createdAt: new Date() };

        const newStudentsArray = students.reduce((acc, cv) => {
          if (cv.id === req.body.student_id) {
            if (cv.hasOwnProperty("numbersOfProjects")) {
              cv.numbersOfProjects += 1;
            } else {
              cv.numbersOfProjects = 1;
            }
          }
          acc.push(cv);
          return acc;
        }, []);

        projects.push(newProject);

        await writeStudents(newStudentsArray);

        await writeProjects(projects);

        res.status(201).send(newProject.id);
      } else {
        const err = new Error();
        err.errorList = errors;
      }
    } catch (error) {
      console.log(error);
    }
  }
);

router.put(
  "/:id",
  [
    check("name").exists().withMessage("name field is mandatory").trim(),
    check("description").exists().withMessage("field mandatory").trim(),
    check("repoUrl")
      .exists()
      .withMessage("field mandatory")
      .isURL()
      .withMessage("must be a valid url")
      .trim(),
    check("liveUrl").trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        const projects = await getProjects();
        // console.log(projects);
        const oldProject = projects.find(
          (project) => project.id === req.params.id
        );
        if (oldProject) {
          const editedProject = {
            ...req.body,
            id: req.params.id,
            updatedAt: new Date(),
            creationDate: oldProject.creationDate,
            student_id: oldProject.student_id,
          };

          const uneditedProject = projects.filter(
            (project) => project.id !== req.params.id
          );
          uneditedProject.push(editedProject);

          await writeProjects(uneditedProject);
          res.status(200).send(editedProject);
          return;
        }
        res.status(404).send("NOT FOUND");
      } else {
        const err = new Error();
        err.errorList = errors;
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// need to student project count by -1 (for later)
router.delete("/:id", async (req, res) => {
  try {
    const projects = await getProjects();

    const newProjectArray = projects.filter(
      (project) => project.id !== req.params.id
    );

    await writeProjects(newProjectArray);

    res.status(204).send();
  } catch (error) {
    console.log(error);
  }
});

router.post(
  "/:id/uploadPhoto",
  multer().single("projectPic"),
  checkFile(["image/jpeg", "image/jpg", "image/png"]),
  async (req, res, next) => {
    console.log(req.file);
    try {
      const { buffer, mimetype } = req.file;
      const projectID = req.params.id;
      console.log(req.url);
      const imgURL = `${req.protocol}://${req.hostname}:${
        process.env.PORT
      }/img/projects/${projectID}.${mimetype.split("/")[1]}`;

      const projects = await getProjects();

      const newProjects = projects.reduce((acc, cv) => {
        if (cv.id === projectID) {
          cv = {
            ...cv,
            image: imgURL,
            updatedAt: new Date(),
          };

          acc.push(cv);
          return acc;
        }
        acc.push(cv);
        return acc;
      }, []);

      writeProjects(newProjects);

      writeProjectPics(`${projectID}.${mimetype.split("/")[1]}`, buffer);

      res.status(200).send({ imgURL });
    } catch (error) {
      console.log(error);
    }
  }
);

router.get("/:id/reviews", async (req, res, next) => {
  try {
    const reviews = await getReviews();
    const getSingleReview = reviews.filter(
      (review) => review.project_id === req.params.id
    );
    if (getSingleReview.length !== 0) {
      res.status(200).send(getSingleReview);
      return;
    }
    res.status(404).send("No reviews for this project");
  } catch (error) {
    console.log(error);
  }
});

router.post(
  "/:id/reviews",
  [
    check("name")
      .exists()
      .withMessage("name of reviewer must be present")
      .trim(),
    check("project_id")
      .notEmpty()
      .withMessage("project id must be included")
      .trim(),
    check("text").notEmpty().withMessage("text should be provided").trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        const newReview = {
          ...req.body,
          id: uuidv4(),
          creationDate: new Date(),
          name: req.body.name || "Anonymous",
        };

        console.log(newReview);

        const reviews = await getReviews();

        reviews.push(newReview);

        await writeReviews(reviews);

        res.status(201).send({ params: newReview.id });
      } else {
        const err = new Error();
        err.errorList = errors;
      }
    } catch (error) {
      console.log(error);
    }
  }
);

export default router;
