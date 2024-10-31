// app/routes/contact.tsx

import { json } from "@remix-run/node";
import nodemailer from "nodemailer";

// Server-side action for the form submission
export async function sendEmail(title: string, receiver: string, message: string) {

  // Configure the email transporter
  let transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com", // Replace with your SMTP provider
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      // user: process.env.EMAIL_USER, // Your email address
      // pass: process.env.EMAIL_PASS, // Your email password
      user: "7e6037001@smtp-brevo.com",
      pass: "xsmtpsib-25111f453db44a155701741974b8744161e6d156ff3e53515e5fa354183e90bb-5zy4CSKd216EBXLR",
    },
  });

  // Define the email options
  let mailOptions = {
    from: receiver,
    to: "manoroldoak@gmail.com",
    subject: JSON.parse(title),
    text: JSON.parse(message), // plain text body
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    return json({ success: true });
  } catch (error) {
    console.error(error);
    return json({ success: false, error: error }, { status: 500 });
  }
}