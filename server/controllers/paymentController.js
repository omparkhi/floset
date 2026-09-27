const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

const razorpayEnabled = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

// @route POST /api/payments/checkout
// @desc Create payment session for a pending booking
exports.createCheckout = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: 'bookingId is required' });
    }

    const booking = await Booking.findOne({
      $or: [
        { _id: bookingId.match(/^[0-9a-fA-F]{24}$/) ? bookingId : null },
        { bookingId }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this booking' });
    }

    if (booking.paymentStatus === 'PAID') {
      return res.status(400).json({ message: 'Booking is already paid' });
    }

    let payment = await Payment.findOne({ bookingId: booking._id, status: { $ne: 'FAILED' } });

    if (!payment) {
      const count = await Payment.countDocuments();
      payment = await Payment.create({
        paymentId: `PAY-${new Date().getFullYear()}-${String(count + 5001)}`,
        bookingId: booking._id,
        userId: req.user._id,
        amount: booking.totalAmount,
        currency: 'INR',
        provider: razorpayEnabled() ? 'RAZORPAY' : 'SIMULATED',
        status: 'CREATED'
      });
    }

    if (razorpayEnabled()) {
      let Razorpay;
      try {
        Razorpay = require('razorpay');
      } catch {
        return res.status(500).json({
          message: 'Razorpay SDK not installed. Run npm install razorpay in server/ or use simulated mode.'
        });
      }

      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });

      const order = await razorpay.orders.create({
        amount: Math.round(booking.totalAmount * 100),
        currency: 'INR',
        receipt: payment.paymentId,
        notes: { bookingId: booking.bookingId }
      });

      payment.providerOrderId = order.id;
      payment.metadata = { razorpayOrder: order };
      await payment.save();

      return res.json({
        success: true,
        mode: 'RAZORPAY',
        keyId: process.env.RAZORPAY_KEY_ID,
        order,
        payment,
        booking
      });
    }

    res.json({
      success: true,
      mode: 'SIMULATED',
      payment,
      booking,
      message: 'Simulated checkout ready — call POST /api/payments/confirm to complete payment'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/payments/confirm
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    const payment = await Payment.findOne({
      $or: [
        { _id: paymentId?.match(/^[0-9a-fA-F]{24}$/) ? paymentId : null },
        { paymentId }
      ]
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (payment.status === 'PAID') {
      return res.json({ success: true, payment, message: 'Already paid' });
    }

    if (payment.provider === 'RAZORPAY' && razorpayEnabled()) {
      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expected !== razorpaySignature) {
        payment.status = 'FAILED';
        await payment.save();
        return res.status(400).json({ message: 'Invalid payment signature' });
      }

      payment.providerPaymentId = razorpayPaymentId;
      payment.providerOrderId = razorpayOrderId;
    }

    payment.status = 'PAID';
    await payment.save();

    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      booking.paymentStatus = 'PAID';
      booking.statusHistory.push({
        status: booking.orderStatus,
        note: 'Payment confirmed — rental secured by FLOSET concierge.'
      });
      await booking.save();
    }

    res.json({
      success: true,
      message: 'Payment successful',
      payment,
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
