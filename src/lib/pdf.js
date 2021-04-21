import PdfPrinter from "pdfmake";
import { pipeline } from "stream";
import { promisify } from "util";
import { pathToPDF } from "./fs-tools.js";
import fs from "fs-extra";

export const asyncPipeline = promisify(pipeline);

export const generatePDF = async (data) => {
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
        { text: "Your booking info", style: "header" },
        {
          ul: [
            `first name: ${data.firstName}`,
            `last name: ${data.lastName}`,
            `email: ${data.email}`,
            `arrival time: ${data.arrivalTime}`,
            `booking id: ${data._id}`,
          ],
        },
      ],
    };

    const printer = new PdfPrinter(fonts);

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition);

    pdfReadableStream.end();

    await asyncPipeline(
      pdfReadableStream,
      fs.createWriteStream(pathToPDF(data._id))
    );
    return pdfReadableStream;
  } catch (error) {
    console.log(error);
    throw new Error("An error occurred when creating PDF");
  }
};
