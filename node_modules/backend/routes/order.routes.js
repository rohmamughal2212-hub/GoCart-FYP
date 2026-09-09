import express from "express";
import authUser from "../middlewares/authUser.js";
import {
  placeOrderCOD,
  placeOrderStripe,
  verifyStripePayment,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getAnalytics,
} from "../controller/order.controller.js";

const router = express.Router();

router.post("/cod", authUser, placeOrderCOD);
router.post("/stripe", authUser, placeOrderStripe);
router.post("/stripe/verify", authUser, verifyStripePayment);
router.get("/user", authUser, getUserOrders);
router.put("/cancel/:id", authUser, cancelOrder);

export default router;
