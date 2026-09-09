import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import nodemailer from "nodemailer";
const strip = (value = "") => value.toString().trim().replace(/^"|"$/g, "");
const smtpUser = strip(process.env.SMTP_USER || process.env.EMAIL_USER || "");
const smtpPass = strip(process.env.SMTP_PASS || process.env.EMAIL_PASS || "");
const smtpHost = strip(process.env.SMTP_HOST || "smtp.gmail.com");
const smtpPort = Number(strip(process.env.SMTP_PORT || "587")) || 587;
console.log({ smtpUser, smtpPass: smtpPass ? '***' : '', smtpHost, smtpPort, NODE_ENV: process.env.NODE_ENV, EMAIL_FROM: process.env.EMAIL_FROM });
const config = {
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: { user: smtpUser, pass: smtpPass },
  tls: { rejectUnauthorized: false },
};
if (smtpHost.toLowerCase().includes('gmail.com')) config.service = 'gmail';
const transporter = nodemailer.createTransport(config);
transporter.verify().then(() => console.log('verified')).catch((e) => { console.error('verify failed', e.message); process.exit(1); });
