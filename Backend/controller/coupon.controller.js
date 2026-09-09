import Coupon from "../models/coupon.model.js";

// POST /api/coupon/validate
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "Coupon code is required" });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Invalid coupon code" });
    if (coupon.expiresAt && coupon.expiresAt < new Date())
      return res.status(400).json({ success: false, message: "Coupon has expired" });
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    if (orderAmount < coupon.minOrderAmount)
      return res.status(400).json({ success: false, message: `Minimum order amount is $${coupon.minOrderAmount}` });

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = Math.min(coupon.discountValue, orderAmount);
    }
    discount = Math.floor(discount * 100) / 100;

    res.status(200).json({ success: true, discount, couponId: coupon._id, message: `Coupon applied! You save $${discount}` });
  } catch (error) {
    console.error("validateCoupon error:", error);
    res.status(500).json({ success: false, message: "Failed to validate coupon", error: error.message });
  }
};

// POST /api/coupon/create  (seller only)
export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscount, expiresAt, usageLimit } = req.body;
    if (!code || !discountType || !discountValue)
      return res.status(400).json({ success: false, message: "Code, discount type, and discount value are required" });

    const coupon = await Coupon.create({ code, discountType, discountValue, minOrderAmount, maxDiscount, expiresAt, usageLimit });
    res.status(201).json({ success: true, coupon, message: "Coupon created" });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: "Coupon code already exists" });
    console.error("createCoupon error:", error);
    res.status(500).json({ success: false, message: "Failed to create coupon", error: error.message });
  }
};

// GET /api/coupon/list  (seller only)
export const listCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error("listCoupons error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch coupons", error: error.message });
  }
};

// DELETE /api/coupon/:id  (seller only)
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await Coupon.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    console.error("deleteCoupon error:", error);
    res.status(500).json({ success: false, message: "Failed to delete coupon", error: error.message });
  }
};
