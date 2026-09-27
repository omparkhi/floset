const Review = require('../models/Review');
const Product = require('../models/Product');
const Booking = require('../models/Booking');

exports.getProductReviews = async (req, res) => {
  try {
    const product = await Product.findOne({
      $or: [
        { _id: req.params.productId.match(/^[0-9a-fA-F]{24}$/) ? req.params.productId : null },
        { productId: req.params.productId }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await Review.find({ productId: product._id, isPublished: true })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, title, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: 'bookingId and rating are required' });
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
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.orderStatus !== 'COMPLETED') {
      return res.status(400).json({ message: 'Reviews are allowed after rental completion' });
    }

    const existing = await Review.findOne({ bookingId: booking._id });
    if (existing) {
      return res.status(400).json({ message: 'You already reviewed this rental' });
    }

    const review = await Review.create({
      productId: booking.productId,
      userId: req.user._id,
      bookingId: booking._id,
      rating: Number(rating),
      title: title || '',
      comment: comment || ''
    });

    const stats = await Review.aggregate([
      { $match: { productId: booking.productId, isPublished: true } },
      {
        $group: {
          _id: '$productId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (stats.length) {
      await Product.findByIdAndUpdate(booking.productId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        reviewsCount: stats[0].count
      });
    }

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
