const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getCart,
  saveCart,
  clearCart,
} = require("../controllers/cartController");

router.get("/", protect, getCart);
router.put("/", protect, saveCart);
router.delete("/", protect, clearCart);

module.exports = router;
