import express from "express";
import authUser from "../middlewares/authUser.js";
import { validateCoupon } from "../controller/coupon.controller.js";

const router = express.Router();

router.post("/validate", authUser, validateCoupon);

export default router;
