import express from "express";
import uniqid from "uniqid";
import multer from "multer";
import { getAttendees, writeAttendees } from "../lib/fs-tools.js";
import { generatePDF, asyncPipeline } from "../lib/pdf.js";
import ErrorResponse from "../lib/errorResponse.js";
import { sendEmail } from "../lib/mail.js";
import { validateAttendee } from "../middleware/middlewareValidation.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "attendiees",
  },
});
const cloudMulter = multer({ storage: cloudStorage });

router.get("/", async (req, res, next) => {
  try {
    const attendees = await getAttendees();
    const query = req.query.name;
    if (query) {
      const findAttendee = attendees.find(
        (attendee) => attendee.name === query
      );
      if (findAttendee) {
        res.status(200).send(findAttendee);
      } else {
        res.status(404).send("Not Found");
      }
    } else {
      res.status(200).send(attendees);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  console.log("UNIQUE id: ", req.params.id);
  try {
    const attendees = await getAttendees();

    const findAttendee = attendees.find(
      (attendee) => attendee._id === req.params.id
    );
    if (findAttendee) {
      res.status(200).send(findAttendee);
    } else {
      res.status(404).send("no attendee with that id");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/", validateAttendee, async (req, res, next) => {
  try {
    const attendees = await getAttendees();
    const newAttendee = { ...req.body, createdAt: new Date(), _id: uniqid() };

    const userAlreadyBooked = attendees.findIndex(
      (attendee) => attendee.email === newAttendee.email
    );
    if (userAlreadyBooked !== -1) {
      res.status(400).send({
        success: false,
        message: `You already booked, please check your mail or use the link below to download the ticket`,
        link: `${req.protocol}://${req.get("host")}/attendees/${
          attendees[userAlreadyBooked]._id
        }/tickets`,
      });
    } else {
      attendees.push(newAttendee);

      await writeAttendees(attendees);
      await sendEmail(newAttendee);

      res.send({ _id: newAttendee._id });
    }
  } catch (error) {
    next(error);
  }
});

router.get("/:id/tickets", async (req, res, next) => {
  try {
    const attendees = await getAttendees();

    const getAttendee = attendees.find(
      (attendee) => attendee._id === req.params.id
    );
    if (getAttendee) {
      const sourceStream = await generatePDF(getAttendee);
      res.set({
        "Content-Type": "application/pdf",
      });

      res.attachment(req.params.id);
      await asyncPipeline(sourceStream, res);
    } else {
      next(new ErrorResponse("Attendee not found", 404));
    }
  } catch (error) {
    next(error);
  }
});

export default router;
