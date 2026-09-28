const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Booking = require("../models/Booking");
const Product = require("../models/Product");
const {
  bookingWindow,
  rangesOverlap,
  isActiveBooking,
  hostBlockOverlaps,
} = require("../utils/bookingOverlap");

const priceKeys = {
  "3_hours": "duration3h",
  "1_day": "duration1d",
  "3_days": "duration3d",
  "5_days": "duration5d",
  "7_days": "duration7d",
};

const findProduct = (id) =>
  Product.findOne({
    $or: [
      { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
      { productId: id },
    ],
    status: "APPROVED",
  });

exports.createOrderRequest = async (req, res) => {
  try {
    const { items, customerName, customerPhone } = req.body;
    if (
      !Array.isArray(items) ||
      !items.length ||
      !customerName?.trim() ||
      !customerPhone?.trim()
    ) {
      return res.status(400).json({
        message:
          "Add at least one rental and provide your name and phone number.",
      });
    }

    const snapshots = [];
    for (const item of items) {
      const product = await findProduct(item.productId);
      if (!product)
        return res.status(404).json({
          message: `Product ${item.productName || ""} is no longer available.`,
        });

      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);
      const durationKey = priceKeys[item.rentalDuration];
      const quantity = Number(item.quantity || 1);
      if (
        !Number.isFinite(startDate.getTime()) ||
        !Number.isFinite(endDate.getTime()) ||
        endDate < startDate ||
        !durationKey ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          message:
            "One or more cart items have invalid dates, duration, or quantity.",
        });
      }

      const hostBlock = hostBlockOverlaps(product, startDate, endDate);
      if (hostBlock)
        return res
          .status(409)
          .json({ message: `${product.name} is unavailable for those dates.` });

      const overlapsExistingItem = snapshots.some(
        (existing) =>
          existing.productId.toString() === product._id.toString() &&
          rangesOverlap(
            startDate,
            endDate,
            existing.startDate,
            existing.endDate,
          ),
      );
      if (overlapsExistingItem)
        return res.status(400).json({
          message: `${product.name} appears more than once for overlapping dates in this cart.`,
        });

      const price = Number(product.pricing?.[durationKey]);
      if (!Number.isFinite(price))
        return res.status(400).json({
          message: `${product.name} has no price for the selected duration.`,
        });
      snapshots.push({
        productId: product._id,
        productCode: product.productId,
        productName: product.name,
        image: product.images?.[0] || "",
        rentalPrice: price,
        quantity,
        type: item.type === "BOOKING" ? "BOOKING" : "ORDER",
        startDate,
        endDate,
        storeId: product.ownerId || null,
        rentalDuration: item.rentalDuration,
        status: "PENDING",
        statusHistory: [{ status: "PENDING" }],
      });
    }

    const totalAmount = snapshots.reduce(
      (sum, item) => sum + item.rentalPrice * item.quantity,
      0,
    );
    const orderId = `FL-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
    const order = await Order.create({
      orderId,
      customerId: req.user._id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: snapshots,
      totalAmount,
      status: "PENDING",
    });

    return res.status(201).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "name email phone")
      .sort({ createdAt: -1 });
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.reviewOrder = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id).session(session);
      if (!order)
        throw Object.assign(new Error("Rental request not found."), {
          status: 404,
        });
      if (order.status !== "PENDING")
        throw Object.assign(
          new Error("Only pending requests can be reviewed."),
          { status: 409 },
        );

      const decision = req.body.status;
      if (!["CONFIRMED", "REJECTED"].includes(decision)) {
        throw Object.assign(
          new Error("Status must be CONFIRMED or REJECTED."),
          { status: 400 },
        );
      }

      if (decision === "CONFIRMED") {
        for (const item of order.items) {
          const product = await Product.findById(item.productId).session(
            session,
          );
          if (!product || product.status !== "APPROVED") {
            throw Object.assign(
              new Error(`${item.productName} is no longer available.`),
              { status: 409 },
            );
          }
          if (hostBlockOverlaps(product, item.startDate, item.endDate)) {
            throw Object.assign(
              new Error(
                `${item.productName} has a host blackout during the requested dates.`,
              ),
              { status: 409 },
            );
          }

          const legacyBookings = await Booking.find({
            productId: item.productId,
            orderStatus: { $ne: "COMPLETED" },
            depositStatus: { $ne: "FORFEITED_DAMAGE" },
            paymentStatus: { $in: ["PENDING", "PAID"] },
          }).session(session);
          const legacyConflict = legacyBookings.find((booking) => {
            if (!isActiveBooking(booking)) return false;
            const range = bookingWindow(booking);
            return rangesOverlap(
              item.startDate,
              item.endDate,
              range.reqStart,
              range.reqEnd,
            );
          });

          const confirmedOrders = await Order.find({
            _id: { $ne: order._id },
            "items.productId": item.productId,
            "items.status": { $nin: ["PENDING", "REJECTED", "COMPLETED"] },
          }).session(session);
          const orderConflict = confirmedOrders.some((otherOrder) =>
            otherOrder.items.some(
              (otherItem) =>
                otherItem.productId.toString() === item.productId.toString() &&
                !["PENDING", "REJECTED", "COMPLETED"].includes(
                  otherItem.status,
                ) &&
                rangesOverlap(
                  item.startDate,
                  item.endDate,
                  otherItem.startDate,
                  otherItem.endDate,
                ),
            ),
          );

          if (legacyConflict || orderConflict) {
            throw Object.assign(
              new Error(
                `${item.productName} overlaps another confirmed rental. This request cannot be approved.`,
              ),
              { status: 409 },
            );
          }

          await Product.updateOne(
            { _id: product._id },
            { $inc: { availabilityRevision: 1 } },
            { session },
          );
        }
      }

      const now = new Date();
      order.status = decision;
      order.items.forEach((item) => {
        if (item.status === "PENDING") {
          item.status = decision;
          item.statusHistory.push({ status: decision, timestamp: now });
        }
      });
      await order.save({ session });
      result = order;
    });
    return res.json({ success: true, order: result });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  } finally {
    await session.endSession();
  }
};

exports.updateOrderItemStatus = async (req, res) => {
  try {
    const allowed = [
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
    ];
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Rental request not found." });
    const item = order.items.id(req.params.itemId);
    if (!item)
      return res.status(404).json({ message: "Rental item not found." });
    if (!allowed.includes(req.body.status))
      return res.status(400).json({ message: "Invalid rental item status." });
    if (req.body.status === "SCHEDULED" && item.type !== "BOOKING")
      return res
        .status(400)
        .json({ message: "Only booking-type rentals can be scheduled." });
    if (item.status === "PENDING")
      return res.status(409).json({
        message: "Approve the rental request before updating item progress.",
      });
    if (item.status === "REJECTED" || item.status === "COMPLETED")
      return res
        .status(409)
        .json({ message: "This rental item is already in a final status." });

    item.status = req.body.status;
    item.statusHistory.push({ status: req.body.status, timestamp: new Date() });
    const itemStatuses = order.items.map((rentalItem) => rentalItem.status);
    if (itemStatuses.every((status) => status === "REJECTED"))
      order.status = "REJECTED";
    else if (
      itemStatuses.every(
        (status) => status === "COMPLETED" || status === "REJECTED",
      )
    )
      order.status = "COMPLETED";
    else if (
      itemStatuses.some((status) =>
        [
          "PREPARING",
          "READY",
          "OUT_FOR_DELIVERY",
          "DELIVERED",
          "RENTED",
          "RETURNED",
        ].includes(status),
      )
    )
      order.status = "PROCESSING";
    else order.status = "CONFIRMED";
    await order.save();
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
