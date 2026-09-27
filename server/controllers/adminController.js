const Product = require('../models/Product');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get pending host listings for admin curation
// @route   GET /api/admin/listings/pending
// @access  Private (Admin)
exports.getPendingListings = async (req, res) => {
  try {
    const pending = await Product.find({ status: 'PENDING_REVIEW' })
      .populate('ownerId', 'name email phone role hostDetails savedAddresses createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pending.length,
      listings: pending
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve listing and set consumer-facing rental prices
// @route   PUT /api/admin/listings/:id/approve
// @access  Private (Admin)
exports.approveListing = async (req, res) => {
  try {
    const {
      pricing,
      securityDeposit,
      adminNotes,
      name,
      category,
      subcategory,
      gender,
      size,
      availableSizes,
      colour,
      description,
      brand,
      badge,
      isFeatured,
      isBestSeller,
      images,
      measurements,
      occasions
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product listing not found' });
    }

    if (name) product.name = name;
    if (category) product.category = category;
    if (subcategory !== undefined) product.subcategory = subcategory;
    if (gender) product.gender = gender;
    if (size) product.size = size;
    if (availableSizes && Array.isArray(availableSizes)) {
      product.availableSizes = availableSizes;
      if (!size && availableSizes.length > 0) product.size = availableSizes[0];
    }
    if (colour) product.colour = colour;
    if (description) product.description = description;
    if (brand) product.brand = brand;
    if (badge !== undefined) product.badge = badge;
    if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);
    if (isBestSeller !== undefined) product.isBestSeller = Boolean(isBestSeller);
    if (images && images.length) product.images = images;
    if (measurements) product.measurements = measurements;
    if (occasions) product.occasions = occasions;

    if (pricing) {
      product.pricing = {
        duration3h: Number(pricing.duration3h) || product.pricing.duration3h,
        duration1d: Number(pricing.duration1d) || product.pricing.duration1d,
        duration3d: Number(pricing.duration3d) || product.pricing.duration3d,
        duration5d: Number(pricing.duration5d) || product.pricing.duration5d,
        duration7d: Number(pricing.duration7d) || product.pricing.duration7d
      };
    }

    if (securityDeposit) {
      product.securityDeposit = Number(securityDeposit);
    }

    if (adminNotes) {
      product.adminReviewNotes = adminNotes;
    }

    product.status = 'APPROVED';
    product.isAvailable = true;

    await product.save();

    res.json({
      success: true,
      message: 'Outfit listing approved and published to FLOSET consumer catalogue',
      product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject listing with feedback notes
// @route   PUT /api/admin/listings/:id/reject
// @access  Private (Admin)
exports.rejectListing = async (req, res) => {
  try {
    const { adminNotes } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product listing not found' });
    }

    product.status = 'REJECTED';
    product.isAvailable = false;
    product.adminReviewNotes = adminNotes || 'Does not meet FLOSET quality guidelines.';

    await product.save();

    res.json({
      success: true,
      message: 'Listing rejected with feedback',
      product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all inventory with internal source tags
// @route   GET /api/admin/products
// @access  Private (Admin)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('ownerId', 'name email phone hostDetails')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product details or toggle availability
// @route   PUT /api/admin/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings across the platform
// @route   GET /api/admin/bookings
// @access  Private (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customerId', 'name email phone')
      .populate('productId', 'productId name images category ownerId sourceType')
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

// @desc    Advance booking through the 15-step FLOSET lifecycle
// @route   PUT /api/admin/bookings/:id/status
// @access  Private (Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { orderStatus, depositStatus, hostPayoutStatus, note } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (orderStatus) {
      booking.orderStatus = orderStatus;
      booking.statusHistory.push({
        status: orderStatus,
        timestamp: new Date(),
        note: note || `Order advanced to ${orderStatus}`
      });
    }

    if (depositStatus) {
      booking.depositStatus = depositStatus;
    }

    if (hostPayoutStatus) {
      booking.hostPayoutStatus = hostPayoutStatus;
    }

    await booking.save();

    res.json({
      success: true,
      message: `Booking status updated to ${booking.orderStatus}`,
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics and stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const approvedProducts = await Product.countDocuments({ status: 'APPROVED' });
    const pendingListings = await Product.countDocuments({ status: 'PENDING_REVIEW' });
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({
      orderStatus: { $nin: ['COMPLETED', 'BOOKING_CONFIRMED'] }
    });

    const bookings = await Booking.find({ paymentStatus: 'PAID' });
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.rentalPrice || 0), 0);
    const totalDepositsHeld = bookings
      .filter((b) => b.depositStatus === 'HELD')
      .reduce((sum, b) => sum + (b.securityDeposit || 0), 0);

    const pendingPayouts = await Booking.countDocuments({ hostPayoutStatus: 'PENDING' });

    res.json({
      success: true,
      stats: {
        totalProducts,
        approvedProducts,
        pendingListings,
        totalBookings,
        activeBookings,
        totalRevenue,
        totalDepositsHeld,
        pendingPayouts
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
