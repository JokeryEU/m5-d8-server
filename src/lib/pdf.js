import fs from "fs-extra";
import { join } from "path";
import PdfPrinter from "pdfmake";
import { pipeline } from "stream";
import { promisify } from "util";
import { getCurrentFolderPath } from "./fs-tools.js";

const asyncPipeline = promisify(pipeline);

export const generatePdf = async (data) => {
  try {
    const fonts = {
      Roboto: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
        italics: "Helvetica-Oblique",
        bolditalics: "Helvetica-BoldOblique",
      },
    };
    const docDefinition = {
      content: [
        "First paragraph",
        "Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines",
      ],
    };

    const printer = new PdfPrinter(fonts);

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition);

    pdfReadableStream.end();

    const path = join(getCurrentFolderPath(import.meta.url), "example.pdf");
    await asyncPipeline(pdfReadableStream, fs.createWriteStream(path));
    return path;
  } catch (error) {
    console.log(error);
    throw new Error("An error occurred when creating PDF");
  }
};
