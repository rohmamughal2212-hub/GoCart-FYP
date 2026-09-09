import mongoose from "mongoose";
import Newsletter from "../models/newsletter.model.js";
import {
  findFallbackNewsletter,
  createFallbackNewsletter,
  updateFallbackNewsletter,
} from "../config/fallbackDb.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isDbConnected = () => mongoose.connection.readyState === 1;

// POST /api/newsletter/subscribe
export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !EMAIL_REGEX.test(email))
      return res.status(400).json({ success: false, message: "Valid email is required" });

    const normalizedEmail = email.toLowerCase();

    if (isDbConnected()) {
      await Newsletter.findOneAndUpdate({ email: normalizedEmail }, { email: normalizedEmail }, { upsert: true });
    } else {
      const existing = await findFallbackNewsletter({ email: normalizedEmail });
      if (existing) {
        await updateFallbackNewsletter({ email: normalizedEmail }, { email: normalizedEmail });
      } else {
        await createFallbackNewsletter({ email: normalizedEmail });
      }
    }

    res.status(200).json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    console.error("subscribe error:", error);
    res.status(500).json({ success: false, message: "Subscription failed", error: error.message });
  }
};
