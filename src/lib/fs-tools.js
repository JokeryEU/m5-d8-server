import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { readJSON, writeJSON } = fs;

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");

export const getAttendees = async () =>
  await readJSON(join(dataFolderPath, "attendees.json"));
export const writeAttendees = async (content) =>
  await writeJSON(join(dataFolderPath, "attendees.json"), content);

export const getCurrentFolderPath = (currentFile) =>
  dirname(fileURLToPath(currentFile));
