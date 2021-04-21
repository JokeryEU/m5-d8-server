import express from "express";
import cors from "cors";
import attendees from "./attendees/index.js";

const app = express();

const whiteList = [process.env.FE_URL_DEV, process.env.FE_URL_PROD];

const corsOptions = {
  origin: function (origin, next) {
    if (whiteList.indexOf(origin) !== -1) {
      console.log("ORIGIN: ", origin);

      next(null, true);
    } else {
      next(new ErrorResponse(`NOT ALLOWED BY CORS`, 403));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/attendees", attendees);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  if (process.env.NODE_ENV === "production") {
    console.log("Server running on cloud on port: ", PORT);
  } else {
    console.log("Server running locally on port: ", PORT);
  }
});
