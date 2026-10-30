import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

export const mailerFrom =
  process.env.SMTP_FROM?.trim() ||
  process.env.SMTP_USER?.trim() ||
  process.env.GMAIL_USER?.trim() ||
  "no-reply@toko.marica.id";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
  port: smtpPort,
  secure: smtpSecure,
  requireTLS: !smtpSecure,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  // Gmail App Password sering disalin dengan spasi di antaranya.
  family: 4,
  auth: {
    user: process.env.SMTP_USER?.trim() || process.env.GMAIL_USER?.trim(),
    pass:
      process.env.SMTP_PASSWORD?.trim() ||
      process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ""),
  },
} as SMTPTransport.Options);
