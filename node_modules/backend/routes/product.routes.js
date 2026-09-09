import express from "express";
import {
  getProductById,
  getProductMeta,
  getProducts,
} from "../controller/product.controller.js";

const router = express.Router();

router.get("/list", getProducts);
router.get("/meta", getProductMeta);
router.get("/id", getProductById);

export default router;
