import express from "express";
import authUser from "../middlewares/authUser.js";
import { upload } from "../config/multer.js";
import {
  registerUser,
  sendOtp,
  verifyOtp,
  loginUser,
  checkAuth,
  logout,
  updateProfile,
  forgotPassword,
  resetPassword,
  toggleWishlist,
  getWishlist,
} from "../controller/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.get("/is-auth", authUser, checkAuth);
router.get("/logout", authUser, logout);
router.put("/profile", authUser, upload.single("profileImage"), updateProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/wishlist/toggle", authUser, toggleWishlist);
router.get("/wishlist", authUser, getWishlist);

export default router;
