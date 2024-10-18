// app/routes/contact.tsx

import { json } from "@remix-run/node";
import nodemailer from "nodemailer";

// Server-side action for the form submission
export async function sendEmail(receiver: string, message: string) {

  // Configure the email transporter
  let transporter = nodemailer.createTransport({
    host: "smtp.example.com", // Replace with your SMTP provider
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password
    },
  });

  // Define the email options
  let mailOptions = {
    from: '"Shopify App" <no-reply@example.com>',
    to: receiver,
    subject: "Thank you for reaching out!",
    text: message, // plain text body
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