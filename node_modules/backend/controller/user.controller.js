import crypto from "crypto";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbAvailable } from "../config/connectDB.js";
import { sendEmail, otpVerificationEmail, welcomeEmail, passwordResetEmail } from "../config/email.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FRONTEND_BASE_URL = String(process.env.FRONTEND_URL || "http://localhost:5173").replace(/^"|"$/g, "").replace(/\/$/, "");

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOtp = (otP) => crypto.createHash("sha256").update(otP).digest("hex");
const createJwtToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const normalizeEmail = (email) => email.toLowerCase().trim();

import { findFallbackUser, createFallbackUser, findFallbackUserById, saveFallbackUser } from "../config/fallbackDb.js";

const isMongoReady = () => dbAvailable && mongoose.connection.readyState === 1;

const findUser = async (query) => {
  const ready = isMongoReady();
  if (ready) {
    try {
      return await User.findOne(query);
    } catch (err) {
      console.warn("Mongo findOne failed, falling back:", err.message);
    }
  }
  return findFallbackUser(query);
};

const createUser = async (doc) => {
  const ready = isMongoReady();
  if (ready) {
    try {
      return await User.create(doc);
    } catch (err) {
      console.warn("Mongo create failed, falling back:", err.message);
    }
  }
  return await createFallbackUser(doc);
};

const findUserById = async (id) => {
  if (isMongoReady()) {
    try {
      return await User.findById(id);
    } catch (err) {
      console.warn("Mongo findById failed, falling back to in-memory storage:", err.message);
    }
  }
  return findFallbackUserById(id);
};

const createUserResponse = (user) => ({
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  profileImage: user.profileImage || "",
});

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    if (!buffer) {
      console.error("❌ NO BUFFER PROVIDED");
      return reject(new Error("No file buffer provided"));
    }
    if (buffer.length === 0) {
      console.error("❌ EMPTY BUFFER PROVIDED");
      return reject(new Error("Empty file buffer"));
    }

    console.log("� Converting image to base64, buffer size:", buffer.length);

    try {
      // Convert buffer to base64 data URL
      const base64String = buffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64String}`;

      console.log("✓ Base64 conversion success");
      console.log("   Data URL length:", dataUrl.length, "characters");
      resolve(dataUrl);
    } catch (err) {
      console.error("❌ Base64 conversion error:", err.message);
      reject(new Error(`Image encoding failed: ${err.message}`));
    }
  });

const validateRegisterPayload = ({ name, email, password }) => {
  if (!name || !email || !password) return "Name, email, and password are required.";
  if (!EMAIL_REGEX.test(email)) return "Invalid email format.";

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':\"\\|,.<>/?]/.test(password);

  const missing = [];
  if (!hasUppercase) missing.push("one uppercase letter");
  if (!hasLowercase) missing.push("one lowercase letter");
  if (!hasDigit) missing.push("one digit");
  if (!hasSpecial) missing.push("one special character");
  if (missing.length > 0) return `Password must include ${missing.join(" and ")}.`;
  if (password.length < 6) return "Password must be at least 6 characters.";
  return null;
};

export const sendOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const validationError = validateRegisterPayload({ name, email, password });
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const normalizedEmail = normalizeEmail(email);
    const existing = await findUser({ email: normalizedEmail });

    if (existing && existing.isVerified)
      return res.status(400).json({ success: false, message: "Email already registered" });

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existing) {
      existing.name = name.trim();
      existing.password = hashedPassword;
      existing.isVerified = false;
      existing.otp = otpHash;
      existing.otpExpire = otpExpire;
      await existing.save();
    } else {
      await createUser({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        otp: otpHash,
        otpExpire,
        isVerified: false,
      });
    }

    const emailResult = await sendEmail({ to: normalizedEmail, ...otpVerificationEmail(otp, name.trim()) });
    const responseBody = {
      success: true,
      message: "OTP sent to your email. It expires in 10 minutes.",
      transportType: emailResult.transportType,
      accepted: emailResult.accepted,
      rejected: emailResult.rejected,
      smtpResponse: emailResult.response,
    };

    if (emailResult.previewUrl) {
      responseBody.previewUrl = emailResult.previewUrl;
    }

    if (emailResult.transportType === "ETHEREAL") {
      responseBody.note = "SMTP delivery was not available, so the OTP was sent via Ethereal preview. Open the preview URL to view the email.";
    }

    res.status(200).json(responseBody);
  } catch (error) {
    console.error("sendOtp error:", error);
    res.status(500).json({ success: false, message: "Unable to send OTP. Please try again later.", error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    if (!EMAIL_REGEX.test(email))
      return res.status(400).json({ success: false, message: "Invalid email format." });

    const normalizedEmail = normalizeEmail(email);
    const user = await findUser({ email: normalizedEmail });

    if (!user || !user.otp || !user.otpExpire)
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    if (user.isVerified)
      return res.status(400).json({ success: false, message: "Account already verified. Please log in." });
    if (user.otpExpire < Date.now())
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    if (hashOtp(otp) !== user.otp)
      return res.status(400).json({ success: false, message: "Incorrect OTP. Please try again." });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    const token = createJwtToken(user._id);
    res.cookie("token", token, cookieOpts);

    sendEmail({ to: user.email, ...welcomeEmail(user.name) }).catch(console.error);

    res.status(200).json({
      success: true,
      message: "OTP verified and account activated.",
      token,
      user: createUserResponse(user),
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    res.status(500).json({ success: false, message: "Unable to verify OTP. Please try again.", error: error.message });
  }
};

export const registerUser = async (req, res) => sendOtp(req, res);

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });
    if (!EMAIL_REGEX.test(email))
      return res.status(400).json({ success: false, message: "Invalid email format" });

    const user = await findUser({ email: normalizeEmail(email) });
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match || !user.isVerified)
      return res.status(401).json({ success: false, message: "Invalid email or password, or account not verified" });

    const token = createJwtToken(user._id);
    res.cookie("token", token, cookieOpts);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: createUserResponse(user),
    });
  } catch (error) {
    console.error("loginUser error:", error);
    res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    if (isMongoReady()) {
      const user = await User.findById(req.user).select("-password -resetPasswordToken -resetPasswordExpire").populate("wishlist").lean();
      if (!user)
        return res.status(404).json({ success: false, message: "User not found" });

      // Ensure profileImage is always included in response
      const responseUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        profileImage: user.profileImage || "",
        cartItems: user.cartItems || {},
        wishlist: user.wishlist || [],
        isVerified: user.isVerified,
      };

      return res.status(200).json({ success: true, user: responseUser });
    }

    const user = await findUserById(req.user);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      profileImage: user.profileImage || "",
      cartItems: user.cartItems || {},
      wishlist: user.wishlist || [],
      isVerified: user.isVerified,
    };

    res.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    console.error("checkAuth error:", error);
    res.status(500).json({ success: false, message: "Auth check failed", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict" });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("logout error:", error);
    res.status(500).json({ success: false, message: "Logout failed", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    console.log("\n=== UPDATE PROFILE REQUEST ===");
    console.log("User ID:", req.user);
    console.log("Request has file?", req.file ? "YES" : "NO");
    if (req.file) {
      console.log("  - Filename:", req.file.originalname);
      console.log("  - Size:", req.file.size, "bytes");
      console.log("  - MIME type:", req.file.mimetype);
      console.log("  - Buffer exists?", req.file.buffer ? "YES (size: " + req.file.buffer.length + ")" : "NO");
    }
    console.log("Body keys:", Object.keys(req.body || {}));

    const { name, phone, currentPassword, newPassword } = req.body;
    const user = await findUserById(req.user);

    if (!user) {
      console.error("❌ User not found for ID:", req.user);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("✓ Found user:", { id: user._id, name: user.name, email: user.email, currentProfileImage: user.profileImage });

    if (name) {
      user.name = name.trim();
      console.log("  - Updated name to:", user.name);
    }
    if (phone) {
      user.phone = phone.trim();
      console.log("  - Updated phone to:", user.phone);
    }

    if (req.file) {
      console.log("📸 Processing image upload:", { size: req.file.size, mimetype: req.file.mimetype });
      try {
        console.log("  - Starting Cloudinary upload...");
        const imageUrl = await uploadToCloudinary(req.file.buffer);
        console.log("  - Cloudinary returned URL:", imageUrl);
        if (!imageUrl || imageUrl.trim() === "") {
          console.error("❌ Cloudinary upload failed: Empty URL returned");
          return res.status(500).json({ success: false, message: "Image upload failed: Empty URL from Cloudinary" });
        }
        user.profileImage = imageUrl;
        console.log("  - Set user.profileImage to:", user.profileImage);
      } catch (uploadError) {
        console.error("❌ Cloudinary upload error:", uploadError.message || uploadError);
        console.error("  - Full error:", uploadError);
        return res.status(500).json({ success: false, message: `Image upload failed: ${uploadError.message}` });
      }
    }

    if (newPassword) {
      if (!currentPassword) {
        console.error("❌ New password without current password");
        return res.status(400).json({ success: false, message: "Current password required to set a new password" });
      }
      if (newPassword.length < 6) {
        console.error("❌ New password too short");
        return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
      }
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        console.error("❌ Current password incorrect");
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
      console.log("  - Password updated");
    }

    console.log("💾 Saving user...");
    console.log("  - User data before save:", { name: user.name, phone: user.phone, profileImage: user.profileImage });
    await user.save();
    console.log("✓ User saved successfully");
    console.log("  - User data after save:", { name: user.name, phone: user.phone, profileImage: user.profileImage });

    const responseUser = {
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      profileImage: user.profileImage || "",
    };

    console.log("📤 Sending response:", responseUser);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: responseUser,
    });
  } catch (error) {
    console.error("❌ updateProfile error:", error.message || error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ success: false, message: "Profile update failed", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !EMAIL_REGEX.test(email))
      return res.status(400).json({ success: false, message: "Valid email is required" });

    const user = await findUser({ email: normalizeEmail(email) });
    if (!user) return res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${FRONTEND_BASE_URL}/reset-password/${token}`;
    const emailResult = await sendEmail({ to: user.email, ...passwordResetEmail(resetUrl) });

    const responseBody = {
      success: true,
      message: "If that email exists, a reset link has been sent",
      transportType: emailResult.transportType,
    };

    if (emailResult.previewUrl) {
      responseBody.previewUrl = emailResult.previewUrl;
      responseBody.note = "SMTP delivery was unavailable, so open the preview link to view the reset email.";
    }

    res.status(200).json(responseBody);
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({ success: false, message: "Failed to process request", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const token = decodeURIComponent(req.params.token || "").trim();
    const { password } = req.body;

    if (!password || password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await findUser({
      $or: [
        { resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } },
        { resetPasswordToken: token, resetPasswordExpire: { $gt: Date.now() } },
      ],
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully. Please log in." });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ success: false, message: "Password reset failed", error: error.message });
  }
};

export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId)
      return res.status(400).json({ success: false, message: "productId is required" });

    const user = await findUserById(req.user);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const idx = user.wishlist.findIndex((item) => String(item?._id || item) === String(productId));
    if (idx === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(idx, 1);
    }
    await user.save();
    const added = idx === -1;
    res.status(200).json({ success: true, added, message: added ? "Added to wishlist" : "Removed from wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error("toggleWishlist error:", error);
    res.status(500).json({ success: false, message: "Failed to update wishlist", error: error.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const user = await findUserById(req.user);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, wishlist: user.wishlist || [] });
  } catch (error) {
    console.error("getWishlist error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch wishlist", error: error.message });
  }
};
