import express from "express";
import authUser from "../middlewares/authUser.js";
import { addReview, getProductReviews, deleteReview } from "../controller/review.controller.js";

const router = express.Router();

router.post("/add", authUser, addReview);
router.get("/:productId", getProductReviews);
router.delete("/:id", authUser, deleteReview);

export default router;
