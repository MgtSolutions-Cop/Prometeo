// src/modules/documents/radication/radication.notifications.js
import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER; // your gmail
const EMAIL_PASS = process.env.EMAIL_PASS; // app password

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn("EMAIL_USER/EMAIL_PASS not set — email notifications disabled");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

/**
 * emailPayload: { to, subject, text, html }
 */
export async function sendEntryNotification(emailPayload) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    return Promise.reject(new Error("Email not configured"));
  }
  if (!emailPayload.to) {
    // No destination email provided; skip
    return Promise.resolve();
  }

  const mailOptions = {
    from: `"Prometeo" <${EMAIL_USER}>`,
    to: emailPayload.to,
    subject: emailPayload.subject || "Notificación Prometeo",
    text: emailPayload.text || "",
    html: emailPayload.html || `<p>${emailPayload.text || ""}</p>`
  };

  return transporter.sendMail(mailOptions);
}
