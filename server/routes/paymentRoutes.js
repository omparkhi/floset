const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createCheckout, confirmPayment } = require('../controllers/paymentController');

router.post('/checkout', protect, createCheckout);
router.post('/confirm', protect, confirmPayment);

module.exports = router;
