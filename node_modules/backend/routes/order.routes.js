import express from "express";
import authUser from "../middlewares/authUser.js";
import {
  placeOrderCOD,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getAnalytics,
} from "../controller/order.controller.js";

const router = express.Router();

router.post("/cod", authUser, placeOrderCOD);
router.get("/user", authUser, getUserOrders);
router.put("/cancel/:id", authUser, cancelOrder);

export default router;
