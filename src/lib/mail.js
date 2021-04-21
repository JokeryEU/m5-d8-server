import sgMail from "@sendgrid/mail";
import { streamToString } from "./fs-tools.js";
import { generatePDF } from "./pdf.js";

export const sendEmail = async (data) => {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const streamedPDF = await generatePDF(data);
    const attachment = await streamToString(streamedPDF);

    const msg = {
      to: data.email,
      from: process.env.SENDER_EMAIL,
      subject: "Booking Confirmation",
      text:
        "You successfully booked for this event, your ticket is in the attachment of this mail",
      attachments: [
        {
          content: attachment,
          filename: "yourBooking.pdf",
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    };

    await sgMail.send(msg);
  } catch (error) {
    console.log(error);
    throw new Error("An error occurred while sending an email");
  }
};
