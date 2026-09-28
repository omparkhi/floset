const mongoose = require("mongoose");
const Cart = require("../models/Cart");

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customerId: req.user._id });
    return res.json({ success: true, items: cart?.items || [] });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.saveCart = async (req, res) => {
  try {
    if (!Array.isArray(req.body.items)) {
      return res.status(400).json({ message: "Cart items must be an array." });
    }
    const items = req.body.items.map((item) => {
      if (
        !mongoose.Types.ObjectId.isValid(item.productId) ||
        !item.productName ||
        !item.startDate ||
        !item.endDate
      ) {
        throw new Error("A cart item is missing product or rental details.");
      }
      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);
      const quantity = Number(item.quantity || 1);
      if (
        !Number.isFinite(startDate.getTime()) ||
        !Number.isFinite(endDate.getTime()) ||
        endDate < startDate ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        throw new Error("A cart item has invalid dates or quantity.");
      }
      return {
        productId: item.productId,
        productCode: item.productCode || "",
        productName: item.productName,
        image: item.image || "",
        rentalPrice: Math.max(0, Number(item.rentalPrice) || 0),
        quantity,
        type: item.type === "BOOKING" ? "BOOKING" : "ORDER",
        startDate,
        endDate,
        rentalDuration: item.rentalDuration || "3_days",
        storeId: mongoose.Types.ObjectId.isValid(item.storeId)
          ? item.storeId
          : null,
      };
    });
    const cart = await Cart.findOneAndUpdate(
      { customerId: req.user._id },
      { $set: { items } },
      { new: true, upsert: true, runValidators: true },
    );
    return res.json({ success: true, items: cart.items });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { customerId: req.user._id },
      { $set: { items: [] } },
      { upsert: true },
    );
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
