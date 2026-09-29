const mongoose = require("mongoose");

const rentalItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productCode: { type: String, required: true },
    productName: { type: String, required: true },
    image: { type: String, default: "" },
    rentalPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 1, min: 1 },
    type: { type: String, enum: ["ORDER", "BOOKING"], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rentalDuration: { type: String, default: "3_days" },
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "SCHEDULED",
        "PREPARING",
        "READY",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "RENTED",
        "RETURNED",
        "COMPLETED",
        "REJECTED",
      ],
      default: "PENDING",
    },
    statusHistory: [
      { status: String, timestamp: { type: Date, default: Date.now } },
    ],
  },
  { timestamps: true },
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true, index: true },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    items: {
      type: [rentalItemSchema],
      validate: [
        (items) => items.length > 0,
        "Order must contain at least one item",
      ],
    },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "REJECTED", "PROCESSING", "COMPLETED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
