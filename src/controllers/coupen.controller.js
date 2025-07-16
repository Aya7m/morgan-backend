import { Coupon } from "../models/coupen.model.js";


// Get all coupons
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json({ data: coupons });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create new coupon
export const createCoupon = async (req, res) => {
  try {
    const { code, type, amount, expiresAt } = req.body;
    const existing = await Coupon.findOne({ code });
    if (existing) return res.status(400).json({ message: "Coupon already exists" });

    const coupon = await Coupon.create({ code, type, amount, expiresAt });
    res.status(201).json({ message: "Coupon created", data: coupon });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.status(200).json({ message: "Coupon updated", data: coupon });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.status(200).json({ message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
