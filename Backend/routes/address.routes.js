import express from "express";
import authUser from "../middlewares/authUser.js";
import { addAddress, getAddress, updateAddress, deleteAddress } from "../controller/address.controller.js";

const router = express.Router();

router.post("/add", authUser, addAddress);
router.get("/get", authUser, getAddress);
router.put("/:id", authUser, updateAddress);
router.delete("/:id", authUser, deleteAddress);

export default router;
