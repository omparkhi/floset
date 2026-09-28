const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createOrderRequest,
  getMyOrders,
  getAdminOrders,
  reviewOrder,
  updateOrderItemStatus,
} = require("../controllers/orderController");

router.post("/", protect, createOrderRequest);
router.get("/my-orders", protect, getMyOrders);
router.get("/admin/all", protect, authorize("admin"), getAdminOrders);
router.put("/:id/review", protect, authorize("admin"), reviewOrder);
router.put(
  "/:id/items/:itemId/status",
  protect,
  authorize("admin"),
  updateOrderItemStatus,
);

module.exports = router;
