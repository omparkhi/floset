const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    rentalDuration: {
      type: String,
      enum: ['3_hours', '1_day', '3_days', '5_days', '7_days'],
      required: true
    },
    startDate: {
      type: Date,
      required: true,
      index: true
    },
    endDate: {
      type: Date,
      required: true,
      index: true
    },
    /** For 3-hour rentals and precise delivery windows */
    startDateTime: { type: Date, index: true },
    endDateTime: { type: Date, index: true },
    rentalPrice: {
      type: Number,
      required: true
    },
    securityDeposit: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    deliveryAddress: {
      name: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'REFUNDED'],
      default: 'PAID'
    },
    depositStatus: {
      type: String,
      enum: ['HELD', 'PARTIALLY_REFUNDED', 'FULLY_REFUNDED', 'FORFEITED_DAMAGE'],
      default: 'HELD'
    },
    orderStatus: {
      type: String,
      enum: [
        'BOOKING_CONFIRMED',
        'SECURED_OUTFIT',
        'PICKUP_FROM_HOST',
        'PHYSICAL_INSPECTION',
        'CLEANING_SANITIZATION',
        'STEAM_IRON',
        'QUALITY_CHECKED',
        'PACKAGED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'IN_USE',
        'RETURN_PICKUP_SCHEDULED',
        'RETURN_INSPECTED',
        'DEPOSIT_REFUNDED',
        'COMPLETED'
      ],
      default: 'BOOKING_CONFIRMED',
      index: true
    },
    hostPayoutStatus: {
      type: String,
      enum: ['NOT_APPLICABLE', 'PENDING', 'SETTLED'],
      default: 'NOT_APPLICABLE'
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
