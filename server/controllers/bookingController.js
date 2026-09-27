const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const {
  resolveRentalWindow,
  bookingWindow,
  rangesOverlap,
  isActiveBooking,
  hostBlockOverlaps
} = require('../utils/bookingOverlap');

// Helper to get duration pricing key
const mapDurationToKey = (duration) => {
  switch (duration) {
    case '3_hours': return 'duration3h';
    case '1_day': return 'duration1d';
    case '3_days': return 'duration3d';
    case '5_days': return 'duration5d';
    case '7_days': return 'duration7d';
    default: return 'duration3d';
  }
};

// @desc    Create a new rental booking
// @route   POST /api/bookings
// @access  Private (Customer)
exports.createBooking = async (req, res) => {
  try {
    const {
      productId,
      rentalDuration,
      startDate,
      endDate,
      startDateTime,
      endDateTime,
      deliveryAddress
    } = req.body;

    if (!productId || !rentalDuration || !startDate || !endDate || !deliveryAddress) {
      return res.status(400).json({ message: 'Please provide all booking details' });
    }

    let reqStart;
    let reqEnd;
    try {
      ({ reqStart, reqEnd } = resolveRentalWindow({
        rentalDuration,
        startDate,
        endDate,
        startDateTime,
        endDateTime
      }));
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const product = await Product.findOne({
        $or: [{ _id: productId.match(/^[0-9a-fA-F]{24}$/) ? productId : null }, { productId }],
        status: 'APPROVED'
      }).session(session);

      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ message: 'Outfit not found or unavailable for rent' });
      }

      const hostBlock = hostBlockOverlaps(product, reqStart, reqEnd);
      if (hostBlock) {
        await session.abortTransaction();
        return res.status(409).json({
          message: 'Outfit is unavailable for the selected period (host blackout).',
          conflict: hostBlock
        });
      }

      const activeBookings = await Booking.find({
        productId: product._id,
        orderStatus: { $ne: 'COMPLETED' },
        depositStatus: { $ne: 'FORFEITED_DAMAGE' },
        paymentStatus: { $in: ['PENDING', 'PAID'] }
      }).session(session);

      const conflict = activeBookings.find((b) => {
        if (!isActiveBooking(b)) return false;
        const { reqStart: bStart, reqEnd: bEnd } = bookingWindow(b);
        return rangesOverlap(reqStart, reqEnd, bStart, bEnd);
      });

      if (conflict) {
        await session.abortTransaction();
        return res.status(409).json({
          message: 'Outfit is already booked for the selected dates. Please select different dates.',
          conflictDates: {
            start: conflict.startDateTime || conflict.startDate,
            end: conflict.endDateTime || conflict.endDate
          }
        });
      }

      const durationKey = mapDurationToKey(rentalDuration);
      const rentalPrice = product.pricing[durationKey] || product.pricing.duration3d;
      const securityDeposit = product.securityDeposit || 1000;
      const totalAmount = rentalPrice + securityDeposit;

      const count = await Booking.countDocuments().session(session);
      const bookingId = `BK-${new Date().getFullYear()}-${String(count + 1001)}`;

      const [booking] = await Booking.create(
        [
          {
            bookingId,
            customerId: req.user._id,
            productId: product._id,
            rentalDuration,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            startDateTime: startDateTime ? new Date(startDateTime) : reqStart,
            endDateTime: endDateTime ? new Date(endDateTime) : reqEnd,
            rentalPrice,
            securityDeposit,
            totalAmount,
            deliveryAddress,
            paymentStatus: 'PENDING',
            depositStatus: 'HELD',
            orderStatus: 'BOOKING_CONFIRMED',
            hostPayoutStatus: product.ownerId ? 'PENDING' : 'NOT_APPLICABLE',
            statusHistory: [
              {
                status: 'BOOKING_CONFIRMED',
                note: 'Rental reserved — complete payment to secure outfit with FLOSET concierge.'
              }
            ]
          }
        ],
        { session }
      );

      await session.commitTransaction();

      res.status(201).json({
        success: true,
        message: 'Rental reserved — complete payment to confirm.',
        booking
      });
    } catch (innerErr) {
      await session.abortTransaction();
      throw innerErr;
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (Customer)
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .populate({
        path: 'productId',
        select: 'productId name images category size colour pricing securityDeposit'
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single booking status and timeline
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { bookingId: req.params.id }]
    }).populate({
      path: 'productId',
      select: 'productId name images category size colour'
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify permission: customer or admin
    if (booking.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
