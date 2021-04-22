import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { readJSON, writeJSON } = fs;

export const pathToPDFforMail = (fileName) =>
  join(dirname(fileURLToPath(import.meta.url)), `../data/pdf/${fileName}`);

export const pathToPDF = (data) =>
  join(dirname(fileURLToPath(import.meta.url)), `../data/pdf/${data._id}.pdf`);

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");

export const getAttendees = async () =>
  await readJSON(join(dataFolderPath, "attendees.json"));
export const writeAttendees = async (content) =>
  await writeJSON(join(dataFolderPath, "attendees.json"), content);

export function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
  });
}
