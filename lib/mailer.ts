import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  // Gmail App Password sering disalin dengan spasi di antaranya.
  family: 4,
  auth: {
    user: process.env.GMAIL_USER?.trim(),
    pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ""),
  },
} as SMTPTransport.Options);
