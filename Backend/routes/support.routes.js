import express from "express";
import { handleSupportQuery } from "../controllers/support.controller.js";

const router = express.Router();

router.post("/query", handleSupportQuery);

export default router;
