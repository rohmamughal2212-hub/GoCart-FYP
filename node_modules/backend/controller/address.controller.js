import Address from "../models/address.model.js";

// POST /api/address/add
export const addAddress = async (req, res) => {
  try {
    const { address } = req.body;
    const userId = req.user;
    if (!address) return res.status(400).json({ success: false, message: "Address data required" });
    await Address.create({ ...address, userId });
    res.status(201).json({ success: true, message: "Address added successfully" });
  } catch (error) {
    console.error("addAddress error:", error);
    res.status(500).json({ success: false, message: "Failed to add address", error: error.message });
  }
};

// GET /api/address/get
export const getAddress = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user });
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.error("getAddress error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch addresses", error: error.message });
  }
};

// PUT /api/address/:id
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { address } = req.body;
    const updated = await Address.findOneAndUpdate({ _id: id, userId: req.user }, { ...address }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Address not found" });
    res.status(200).json({ success: true, message: "Address updated", address: updated });
  } catch (error) {
    console.error("updateAddress error:", error);
    res.status(500).json({ success: false, message: "Failed to update address", error: error.message });
  }
};

// DELETE /api/address/:id
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Address.findOneAndDelete({ _id: id, userId: req.user });
    if (!deleted) return res.status(404).json({ success: false, message: "Address not found" });
    res.status(200).json({ success: true, message: "Address deleted" });
  } catch (error) {
    console.error("deleteAddress error:", error);
    res.status(500).json({ success: false, message: "Failed to delete address", error: error.message });
  }
};
