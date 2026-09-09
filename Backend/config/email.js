import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const stripQuotes = (value = "") => value.toString().trim().replace(/^"|"$/g, "");
const smtpUser = stripQuotes(process.env.SMTP_USER || process.env.EMAIL_USER || "");
const smtpPass = stripQuotes(process.env.SMTP_PASS || process.env.EMAIL_PASS || "");
const smtpHost = stripQuotes(process.env.SMTP_HOST || "smtp.gmail.com");
const smtpPort = Number(stripQuotes(process.env.SMTP_PORT || "587")) || 587;

// Debug: Log SMTP config
console.error("📧 SMTP Config Loaded:", {
  user: smtpUser,
  pass: smtpPass ? `${smtpPass.substring(0, 3)}...${smtpPass.substring(smtpPass.length - 3)}` : "NOT SET",
  passLength: smtpPass ? smtpPass.length : 0,
  host: smtpHost,
  port: smtpPort
});

const sendgridApiKey = stripQuotes(process.env.SENDGRID_API_KEY || "");
const sendgridUser = stripQuotes(process.env.SENDGRID_SMTP_USER || "apikey");
const sendgridPass = stripQuotes(process.env.SENDGRID_SMTP_PASS || "");
const sendgridHost = stripQuotes(process.env.SENDGRID_SMTP_HOST || "smtp.sendgrid.net");
const sendgridPort = Number(stripQuotes(process.env.SENDGRID_SMTP_PORT || "587")) || 587;
const emailProvider = stripQuotes(process.env.EMAIL_PROVIDER || "").toLowerCase();
const hasRealEmailProvider = Boolean(
  (smtpUser && smtpPass) ||
  sendgridApiKey ||
  (sendgridUser && sendgridPass)
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.join(__dirname, "../../Frontend/public/logo.png");
const logoCid = "gocart-logo@goCart";

const logoUrl = stripQuotes(process.env.LOGO_IMAGE_URL || "");

let goCartLogoBuffer = null;
let logoDataUri = "";
try {
  console.log("Logo path:", logoPath);
  console.log("Logo file exists:", fs.existsSync(logoPath));
  if (fs.existsSync(logoPath)) {
    goCartLogoBuffer = fs.readFileSync(logoPath);
    logoDataUri = `data:image/png;base64,${goCartLogoBuffer.toString("base64")}`;
    console.log("Logo loaded successfully, base64 length:", logoDataUri.length);
  } else {
    console.warn("Logo file not found at:", logoPath);
  }
} catch (err) {
  console.warn("Could not load logo file:", err.message);
}

const logoImageHtml = logoUrl
  ? `<img src="${logoUrl}" alt="Go Cart Logo" style="height:80px; width:auto; max-width:100%; display:block; margin:0 auto;"/>`
  : logoDataUri
    ? `<img src="${logoDataUri}" alt="Go Cart Logo" style="height:80px; width:auto; max-width:100%; display:block; margin:0 auto;"/>`
    : '<div style="padding: 16px 22px; border-radius: 18px; background: #1B3A6B; color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif; display:inline-block;">🛒 Go Cart</div>';

console.log("Logo configuration complete. Using:", logoUrl ? "URL" : logoDataUri ? "Base64 Data URI" : "Fallback text");

const getGoogleDriveDirectUrl = (url) => {
  if (!url) return "";
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)|open\?id=([a-zA-Z0-9_-]+))/);
  if (driveMatch) {
    const fileId = driveMatch[1] || driveMatch[2];
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  return url;
};

// Helper to get the latest logo HTML (in case it changes)
const getLogoImageHtml = () => {
  return '<div style="background:#ffffff; color:#0d2a66; border:2px solid #0d2a66; border-radius:18px; padding:18px 28px; display:inline-block; font-family:Arial, sans-serif; font-size:28px; font-weight:900; letter-spacing:1px; text-align:center; margin:0 auto;">🛒 GoCart</div>';
};

const createSendGridTransporter = async () => {
  const auth = sendgridApiKey
    ? { user: "apikey", pass: sendgridApiKey }
    : { user: sendgridUser || "apikey", pass: sendgridPass };

  if (!auth.pass) {
    throw new Error("SendGrid is configured but no API key or SMTP password was provided.");
  }

  const transporter = nodemailer.createTransport({
    host: sendgridHost,
    port: sendgridPort,
    secure: sendgridPort === 465,
    auth,
    tls: { rejectUnauthorized: false },
  });
  await transporter.verify();
  return transporter;
};

const createSmtpTransporter = async () => {
  const transporterConfig = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
    tls: { rejectUnauthorized: false },
  };

  if (smtpHost.toLowerCase().includes("gmail.com")) {
    transporterConfig.service = "gmail";
  }

  const transporter = nodemailer.createTransport(transporterConfig);
  try {
    await transporter.verify();
  } catch (err) {
    if (smtpHost.toLowerCase().includes("gmail.com") && err && err.code === "EAUTH") {
      err.message = `${err.message} Gmail authentication failed. If you are using Gmail, enable 2-Step Verification and use an app password instead of your normal account password.`;
    }
    throw err;
  }

  return transporter;
};

const createTransporter = async () => {
  if ((emailProvider === "sendgrid" || sendgridApiKey || sendgridPass) && (sendgridApiKey || sendgridPass)) {
    return { transporter: await createSendGridTransporter(), type: "SENDGRID" };
  }

  if (smtpUser && smtpPass) {
    return { transporter: await createSmtpTransporter(), type: "SMTP" };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SMTP is not configured. Provide SMTP_USER/SMTP_PASS or SendGrid credentials to send email in production.");
  }

  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  return { transporter, type: "ETHEREAL" };
};

const createEtherealTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const fromAddress = stripQuotes(process.env.EMAIL_FROM || smtpUser || "no-reply@gocart.local");
  let transportType = "SMTP";
  let transporter;
  try {
    const result = await createTransporter();
    transporter = result.transporter;
    transportType = result.type;
  } catch (err) {
    if (process.env.NODE_ENV === "production") throw err;
    console.warn("SMTP transporter creation failed; falling back to Ethereal email preview in development.", err && err.message);
    transportType = "ETHEREAL";
    transporter = await createEtherealTransporter();
  }

  const attachments = [];

  console.log("📧 SEND EMAIL DEBUG:");
  console.log("  - goCartLogoBuffer exists:", !!goCartLogoBuffer, "size:", goCartLogoBuffer ? goCartLogoBuffer.length : "N/A");
  console.log("  - Attachments count:", attachments.length);
  if (attachments.length > 0) {
    console.log("  - Attachment:", attachments[0].filename, "CID:", attachments[0].cid, "Buffer size:", attachments[0].content.length);
  }
  console.log("  - HTML contains 'cid:'?", html.includes("cid:"));
  console.log("  - HTML length:", html.length);

  let info;
  try {
    info = await transporter.sendMail({ from: fromAddress, to, subject, html, attachments });
    if (info.rejected && info.rejected.length > 0) {
      throw new Error(`Email rejected for recipients: ${info.rejected.join(", ")}`);
    }
  } catch (err) {
    if (process.env.NODE_ENV === "production") throw err;
    transportType = "ETHEREAL";
    console.warn("SMTP send failed; falling back to Ethereal email preview in development.", err && err.message);
    transporter = await createEtherealTransporter();
    info = await transporter.sendMail({ from: fromAddress, to, subject, html, attachments });
  }

  const previewUrl = transportType === "ETHEREAL" ? nodemailer.getTestMessageUrl(info) : null;
  let emailResult = {
    transportType,
    messageId: info && info.messageId,
    accepted: info && info.accepted,
    rejected: info && info.rejected,
    response: info && info.response,
    previewUrl,
  };

  try {
    console.log("Email transport used:", transportType);
    console.log("Email send result:", emailResult);
  } catch (e) {
    console.warn("Failed to log email info:", e && e.message);
  }

  if (previewUrl) {
    console.log(`📧 Email preview URL: ${previewUrl}`);
  }

  return emailResult;
};

export const otpVerificationEmail = (otp, userName = "") => ({
  subject: "Your Go Cart Verification Code",
  html: `
    <div style="font-family: Arial, sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        ${getLogoImageHtml()}
      </div>
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);">
        <h2 style="color: #1d4ed8; margin-top: 0;">Hi ${userName || "there"},</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">Use the code below to complete your GoCart registration. The code expires in 10 minutes.</p>
        <div style="display: inline-block; padding: 16px 22px; margin: 20px 0; background: #eef2ff; color: #1d4ed8; font-size: 1.75rem; letter-spacing: 0.25rem; border-radius: 12px; font-weight: 700;">${otp}</div>
        <p style="font-size: 14px; line-height: 1.7; color: #6b7280;">If you did not request this code, you can safely ignore this message.</p>
      </div>
    </div>
  `,
});

const emailText = (value) => String(value ?? "-")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

export const orderConfirmationEmail = (userName, order) => {
  const address = order.address && typeof order.address === "object" ? order.address : {};
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsSubtotal = items.reduce((sum, item) => {
    const product = item.product && typeof item.product === "object" ? item.product : {};
    const quantity = Number(item.quantity || item.qty || 1);
    const unitPrice = Number(item.unitPrice || item.price || product.offerPrice || product.price || 0);
    return sum + (unitPrice * quantity);
  }, 0);
  const finalAmount = Number(order.amount || order.total || 0);
  const shippingCharge = 250;
  const serviceCharge = 250;
  const itemRows = items.map((item) => {
    const product = item.product && typeof item.product === "object" ? item.product : {};
    const name = product.name || product.title || item.name || item.title || "Product";
    const quantity = Number(item.quantity || item.qty || 1);
    const unitPrice = Number(item.unitPrice || item.price || product.offerPrice || product.price || 0);
    const subtotal = Number(item.subtotal ?? unitPrice * quantity);
    return `<tr><td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;">${emailText(name)}</td><td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;text-align:center;">${quantity}</td><td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">PKR ${unitPrice.toLocaleString()}</td><td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">PKR ${subtotal.toLocaleString()}</td></tr>`;
  }).join("");
  const addressText = [address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean).join(", ");

  return {
    subject: `Order Confirmed — GoCart #${order._id}`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#172033;max-width:680px;margin:0 auto;padding:24px;background:#f5f7fb;">
        <div style="background:#ffffff;border:1px solid #dbe2ee;padding:28px;">
          <table role="presentation" style="width:100%;border-bottom:2px solid #172033;padding-bottom:16px;margin-bottom:22px;"><tr><td style="vertical-align:top;text-align:left;"><h1 style="margin:0;font-size:25px;">GoCart</h1><p style="margin:6px 0 0;color:#667085;">Order receipt</p></td><td style="vertical-align:top;text-align:right;color:#667085;font-size:13px;white-space:nowrap;">Order #${emailText(order._id)}<br>${order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</td></tr></table>
          <h2 style="font-size:20px;margin:0 0 8px;">Hi ${emailText(userName)}, your order is confirmed!</h2>
          <p style="color:#667085;line-height:1.6;">Thank you for shopping with GoCart. Here is your complete order receipt.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:22px 0;">
            <div><h3 style="font-size:15px;margin:0 0 7px;">Delivery details</h3><p style="margin:0;color:#667085;line-height:1.6;">${emailText(address.firstName || "")} ${emailText(address.lastName || "")}<br>${emailText(address.phone || "-")}<br>${emailText(addressText || "Address not available")}</p></div>
            <div><h3 style="font-size:15px;margin:0 0 7px;">Order details</h3><p style="margin:0;color:#667085;line-height:1.6;">Payment: ${emailText(order.paymentType || "COD")}<br>Status: ${emailText(order.status || "Order Placed")}<br>Paid: ${order.isPaid ? "Yes" : "No"}</p></div>
          </div>
          <h3 style="font-size:15px;margin:24px 0 8px;">Ordered products</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr style="color:#667085;text-align:left;"><th style="padding:10px 8px;border-bottom:1px solid #dbe2ee;">Product</th><th style="padding:10px 8px;border-bottom:1px solid #dbe2ee;text-align:center;">Qty</th><th style="padding:10px 8px;border-bottom:1px solid #dbe2ee;text-align:right;">Unit price</th><th style="padding:10px 8px;border-bottom:1px solid #dbe2ee;text-align:right;">Subtotal</th></tr></thead><tbody>${itemRows || "<tr><td colspan=\"4\" style=\"padding:12px 8px;\">Product details unavailable</td></tr>"}</tbody></table>
          <table role="presentation" style="width:100%;margin-top:22px;font-size:13px;color:#667085;"><tr><td style="text-align:right;padding:3px 0;">Items subtotal:</td><td style="text-align:right;padding:3px 0 3px 18px;width:130px;">PKR ${Math.floor(itemsSubtotal).toLocaleString()}</td></tr><tr><td style="text-align:right;padding:3px 0;">Shipping:</td><td style="text-align:right;padding:3px 0 3px 18px;">PKR ${shippingCharge.toLocaleString()}</td></tr><tr><td style="text-align:right;border-top:2px solid #172033;padding:10px 0 0;font-size:18px;font-weight:700;color:#172033;">Final amount:</td><td style="text-align:right;border-top:2px solid #172033;padding:10px 0 0 18px;font-size:18px;font-weight:700;color:#172033;">PKR ${finalAmount.toLocaleString()}</td></tr></table>
        </div>
      </div>
    `,
  };
};

export const welcomeEmail = (userName) => ({
  subject: "Welcome to Go Cart",
  html: `
    <div style="font-family: Arial, sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        ${getLogoImageHtml()}
      </div>
      <h2 style="color: #1d4ed8; margin-top: 0;">Welcome to Go Cart, ${userName}!</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #374151;">Your account has been verified and is ready to use.</p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151;">Browse products, place orders, and enjoy fast delivery.</p>
      <p style="font-size: 14px; line-height: 1.7; color: #6b7280;">If you have any questions, we're here to help.</p>
    </div>
  `,
});

export const passwordResetEmail = (resetUrl) => ({
  subject: "Password Reset — Go Cart",
  html: `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password. This link expires in 1 hour.</p>
    <a href="${resetUrl}" style="background:#6366f1;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none">Reset Password</a>
    <p>If you did not request this, ignore this email.</p>
  `,
});
