// src/services/notification.service.js
import nodemailer from "nodemailer";
import twilio from "twilio";

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER,
} = process.env;

// ✅ Email transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// ✅ Twilio client
const twilioClient =
  TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN
    ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    : null;

export const sendOrderEmail = async ({ to, subject, text }) => {
  if (!to) return;
  try {
    await transporter.sendMail({
      from: `"Hunger Bites" <${EMAIL_USER}>`,
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error("Email send error:", err.message);
  }
};

export const sendOrderSMS = async ({ to, text }) => {
  if (!twilioClient || !to) return;
  try {
    await twilioClient.messages.create({
      from: TWILIO_FROM_NUMBER,
      to, // should be in E.164 format, e.g. +9198xxxxxx
      body: text,
    });
  } catch (err) {
    console.error("SMS send error:", err.message);
  }
};

// Helper: send both email + sms for order status update
export const sendOrderStatusNotification = async ({
  email,
  phone,
  name,
  orderId,
  status,
  trackingId,
}) => {
  const subject = `Your order ${orderId} is now ${status}`;
  const text = `Hi ${name || "Customer"},\n\nYour order (${orderId}) status is now: ${status}.
Tracking ID: ${trackingId || "N/A"}.\n\nThank you for ordering from Hunger Bites!`;

  await sendOrderEmail({ to: email, subject, text });

  // For India: phone should be like +91XXXXXXXXXX
  if (phone) {
    const normalizedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
    await sendOrderSMS({ to: normalizedPhone, text });
  }
};
