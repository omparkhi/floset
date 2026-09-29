const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productCode: { type: String, default: "" },
    productName: { type: String, required: true },
    image: { type: String, default: "" },
    rentalPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 1, min: 1 },
    type: { type: String, enum: ["ORDER", "BOOKING"], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rentalDuration: { type: String, required: true },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

const cartSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Cart", cartSchema);
