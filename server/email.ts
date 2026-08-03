import nodemailer from "nodemailer";
import { getRequiredEnv } from "@/server/get-required-env";

export async function sendOneTimeCode(email: string, code: string) {
  const transporter = nodemailer.createTransport({
    host: getRequiredEnv("SMTP_HOST"),
    port: Number(getRequiredEnv("SMTP_PORT")),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: getRequiredEnv("SMTP_USERNAME"),
      pass: getRequiredEnv("SMTP_PASSWORD"),
    },
  });

  await transporter.sendMail({
    from: getRequiredEnv("SMTP_FROM"),
    to: email,
    subject: "Your xiv.today code",
    text: `Your xiv.today code is ${code}. It expires in 24 hours.`,
  });
}
