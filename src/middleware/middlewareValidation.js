import { check, validationResult } from "express-validator";
import ErrorResponse from "../lib/errorResponse.js";

export const validateAttendee = [
  check("firstName")
    .trim()
    .notEmpty()
    .withMessage("first name must not be empty"),
  check("lastName")
    .trim()
    .notEmpty()
    .withMessage("last name must not be empty"),
  check("email")
    .trim()
    .isEmail()
    .notEmpty()
    .withMessage("email must not be empty"),
  check("arrivalTime")
    .trim()
    .notEmpty()
    .withMessage("time of arrival must not be empty"),
  //   check('productId').trim().notEmpty().withMessage('productId cannot be empty'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new ErrorResponse(
        `Something went wrong with validation`,
        400,
        "validateAttendee"
      );
      error.errList = errors;
      return next(error);
    }
    next();
  },
];
