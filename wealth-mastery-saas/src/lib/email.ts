import nodemailer from "nodemailer";

/** Sends an email if SMTP is configured; otherwise logs the message
 *  (so password-reset still works in dev / before SMTP is set up). */
export async function sendEmail(to: string, subject: string, html: string) {
  const host = process.env.EMAIL_SERVER_HOST;
  if (!host) {
    console.log("\n[email:fallback] To:", to, "\nSubject:", subject, "\n", html, "\n");
    return { delivered: false, logged: true };
  }
  const transport = nodemailer.createTransport({
    host,
    port: Number(process.env.EMAIL_SERVER_PORT || 587),
    secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
    auth: { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASSWORD },
  });
  await transport.sendMail({ from: process.env.EMAIL_FROM || "Wealth Mastery OS <noreply@example.com>", to, subject, html });
  return { delivered: true, logged: false };
}
