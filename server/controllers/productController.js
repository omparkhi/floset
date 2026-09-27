const User = require('../models/User');
const Product = require('../models/Product');
const Booking = require('../models/Booking');
const {
  resolveRentalWindow,
  bookingWindow,
  rangesOverlap,
  isActiveBooking,
  hostBlockOverlaps
} = require('../utils/bookingOverlap');

const mapHostSourceType = (hostType) => {
  if (hostType === 'DESIGNER') return 'DESIGNER';
  if (hostType === 'STORE') return 'STORE';
  return 'INDIVIDUAL';
};

// @desc    Get all active/approved products with filtering, sorting, searching
// @route   GET /api/products
// @access  Public (Sanitized for customers)
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      gender,
      occasion,
      size,
      colour,
      minPrice,
      maxPrice,
      search,
      sort,
      featured,
      bestseller,
      duration = 'duration3d' // default comparison duration
    } = req.query;

    const query = { status: 'APPROVED' };

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (gender && gender !== 'all') {
      query.gender = { $in: [gender, 'Unisex'] };
    }

    if (occasion && occasion !== 'all') {
      query.occasions = occasion;
    }

    if (size && size !== 'all') {
      query.$or = [{ size: size }, { availableSizes: size }];
    }

    if (colour && colour !== 'all') {
      query.colour = { $regex: new RegExp(colour, 'i') };
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (bestseller === 'true') {
      query.isBestSeller = true;
    }

    if (minPrice || maxPrice) {
      const priceField = `pricing.${duration}`;
      query[priceField] = {};
      if (minPrice) query[priceField].$gte = Number(minPrice);
      if (maxPrice) query[priceField].$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { occasions: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') {
      sortOption = { [`pricing.${duration}`]: 1 };
    } else if (sort === 'price-high') {
      sortOption = { [`pricing.${duration}`]: -1 };
    } else if (sort === 'popular') {
      sortOption = { rating: -1, reviewsCount: -1 };
    }

    const products = await Product.find(query).sort(sortOption);

    // Strictly sanitize: NEVER expose owner or source fields to customers
    const sanitized = products.map((p) => p.toCustomerJSON());

    res.json({
      success: true,
      count: sanitized.length,
      products: sanitized
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public (Sanitized for customers)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { productId: req.params.id }],
      status: 'APPROVED'
    });

    if (!product) {
      return res.status(404).json({ message: 'Outfit not found or not currently available' });
    }

    res.json(product.toCustomerJSON());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check product availability for specific dates & get booked blackout dates
// @route   GET /api/products/:id/availability
// @access  Public
exports.checkAvailability = async (req, res) => {
  try {
    const { startDate, endDate, startDateTime, endDateTime, rentalDuration } = req.query;

    const product = await Product.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { productId: req.params.id }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find all active / confirmed bookings for this product
    const activeBookings = await Booking.find({
      productId: product._id,
      orderStatus: { $ne: 'COMPLETED' },
      depositStatus: { $ne: 'FORFEITED_DAMAGE' }
    }).select('startDate endDate rentalDuration orderStatus');

    const bookedRanges = activeBookings.map(b => ({
      startDate: b.startDate,
      endDate: b.endDate,
      duration: b.rentalDuration
    }));

    let isAvailableForSelectedDates = true;
    let conflictDetails = null;

    if (startDate && endDate) {
      let requestedStart;
      let requestedEnd;
      try {
        ({ reqStart: requestedStart, reqEnd: requestedEnd } = resolveRentalWindow({
          rentalDuration: rentalDuration || '3_days',
          startDate,
          endDate,
          startDateTime,
          endDateTime
        }));
      } catch {
        isAvailableForSelectedDates = false;
      }

      if (requestedStart && requestedEnd) {
        const hostBlock = hostBlockOverlaps(product, requestedStart, requestedEnd);
        if (hostBlock) {
          isAvailableForSelectedDates = false;
          conflictDetails = { type: 'host_block', hostBlock };
        } else {
          const conflict = activeBookings.find((b) => {
            if (!isActiveBooking(b)) return false;
            const { reqStart: bStart, reqEnd: bEnd } = bookingWindow(b);
            return rangesOverlap(requestedStart, requestedEnd, bStart, bEnd);
          });

          if (conflict) {
            isAvailableForSelectedDates = false;
            conflictDetails = {
              type: 'booking',
              conflictStart: conflict.startDateTime || conflict.startDate,
              conflictEnd: conflict.endDateTime || conflict.endDate
            };
          }
        }
      }
    }

    res.json({
      productId: product.productId,
      isAvailable: isAvailableForSelectedDates,
      conflict: conflictDetails,
      bookedRanges,
      hostBlocks: (product.hostAvailabilityBlocks || []).map((b) => ({
        startDate: b.startDate,
        endDate: b.endDate,
        note: b.note || 'Shopkeeper Blackout Window'
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit outfit to "List Your Outfit" flow
// @route   POST /api/products/list-outfit
// @access  Private (Shopkeeper / Partner / Host)
exports.listOutfit = async (req, res) => {
  try {
    const {
      name,
      category,
      gender,
      size,
      measurements,
      colour,
      condition,
      description,
      brand,
      occasions,
      images,
      expectedEarning,
      rentalDurationPreference,
      additionalDayCharge,
      pickupAddress,
      includedAccessories,
      subcategory,
      hostAvailabilityBlocks,
      availableSizes
    } = req.body;

    const resolvedAvailableSizes = Array.isArray(availableSizes) && availableSizes.length > 0
      ? availableSizes
      : (size ? [size] : ['M']);
    const primarySize = size || resolvedAvailableSizes[0] || 'M';

    if (!name || !category || !gender || !primarySize || !colour || !expectedEarning) {
      return res.status(400).json({ message: 'Please provide all required outfit details' });
    }

    const count = await Product.countDocuments();
    const prefix = gender === 'Women' ? 'FL-W' : gender === 'Men' ? 'FL-M' : 'FL-U';
    const productId = `${prefix}-${String(count + 101).padStart(3, '0')}`;

    // Host / Shopkeeper provides their expected earning.
    // FLOSET sets placeholder internal pricing until admin reviews & sets final consumer prices.
    const baseEarning = Number(expectedEarning);
    const placeholderPricing = {
      duration3h: Math.round(baseEarning * 0.7),
      duration1d: Math.round(baseEarning * 1.0),
      duration3d: Math.round(baseEarning * 1.5),
      duration5d: Math.round(baseEarning * 2.0),
      duration7d: Math.round(baseEarning * 2.5)
    };

    const isShopkeeper = req.user.role === 'shopkeeper' || req.user.hostDetails?.type === 'STORE';

    const newProduct = await Product.create({
      productId,
      name,
      category,
      subcategory: subcategory || '',
      gender,
      size: primarySize,
      availableSizes: resolvedAvailableSizes,
      measurements: measurements || {},
      colour,
      condition: condition || 'Like New',
      description,
      brand: brand || (isShopkeeper ? req.user.hostDetails?.businessName || 'Boutique Collection' : 'Bespoke / Boutique'),
      occasions: occasions && occasions.length ? occasions : ['Party'],
      images: images && images.length ? images : ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop'],
      includedAccessories: includedAccessories || [],
      pricing: placeholderPricing,
      securityDeposit: Math.round(baseEarning * 1.5),
      isAvailable: false, // Inactive until approved
      status: 'PENDING_REVIEW', // Awaits admin approval
      ownerId: req.user._id,
      sourceType: isShopkeeper ? 'STORE' : mapHostSourceType(req.user.hostDetails?.type),
      hostAvailabilityBlocks: hostAvailabilityBlocks || [],
      ownerExpectedEarning: baseEarning,
      ownerRentalDurationPreference: rentalDurationPreference || '3_days',
      additionalDayCharge: additionalDayCharge || 250,
      ownerPickupAddress: pickupAddress || {}
    });

    // Automatically set isHost: true
    await User.findByIdAndUpdate(req.user._id, {
      isHost: true,
      ...(req.user.role === 'customer' ? { role: 'shopkeeper' } : {})
    });

    res.status(201).json({
      success: true,
      message: 'Outfit submitted successfully for FLOSET curation review',
      isHost: true,
      listing: newProduct
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get listings submitted by the logged-in host/shopkeeper
// @route   GET /api/products/host/my-listings
// @access  Private (Host / Shopkeeper)
exports.getHostListings = async (req, res) => {
  try {
    const listings = await Product.find({ ownerId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: listings.length,
      listings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update listing by shopkeeper / owner
// @route   PUT /api/products/host/:id
// @access  Private (Owner / Shopkeeper)
exports.updateHostListing = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product listing not found' });
    }

    // Verify ownership or admin
    if (product.ownerId && product.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const {
      name,
      description,
      category,
      subcategory,
      gender,
      size,
      measurements,
      colour,
      condition,
      brand,
      occasions,
      images,
      includedAccessories,
      expectedEarning,
      rentalDurationPreference,
      additionalDayCharge,
      pickupAddress,
      hostAvailabilityBlocks,
      isAvailable,
      availableSizes
    } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (subcategory !== undefined) product.subcategory = subcategory;
    if (gender) product.gender = gender;
    if (size) product.size = size;
    if (availableSizes && Array.isArray(availableSizes)) {
      product.availableSizes = availableSizes;
      if (!size && availableSizes.length > 0) product.size = availableSizes[0];
    }
    if (measurements) product.measurements = measurements;
    if (colour) product.colour = colour;
    if (condition) product.condition = condition;
    if (brand) product.brand = brand;
    if (occasions) product.occasions = occasions;
    if (images && images.length) product.images = images;
    if (includedAccessories !== undefined) product.includedAccessories = includedAccessories;
    if (rentalDurationPreference) product.ownerRentalDurationPreference = rentalDurationPreference;
    if (additionalDayCharge) product.additionalDayCharge = Number(additionalDayCharge);
    if (pickupAddress) product.ownerPickupAddress = pickupAddress;
    if (hostAvailabilityBlocks) product.hostAvailabilityBlocks = hostAvailabilityBlocks;
    if (isAvailable !== undefined) product.isAvailable = Boolean(isAvailable);

    if (expectedEarning) {
      product.ownerExpectedEarning = Number(expectedEarning);
      if (product.status === 'PENDING_REVIEW') {
        const baseEarning = Number(expectedEarning);
        product.pricing = {
          duration3h: Math.round(baseEarning * 0.7),
          duration1d: Math.round(baseEarning * 1.0),
          duration3d: Math.round(baseEarning * 1.5),
          duration5d: Math.round(baseEarning * 2.0),
          duration7d: Math.round(baseEarning * 2.5)
        };
        product.securityDeposit = Math.round(baseEarning * 1.5);
      }
    }

    // If listing was rejected and shopkeeper updates it, return it to PENDING_REVIEW
    if (product.status === 'REJECTED') {
      product.status = 'PENDING_REVIEW';
      product.adminReviewNotes = 'Re-submitted by partner with updates.';
    }

    await product.save();

    res.json({
      success: true,
      message: 'Listing updated successfully',
      listing: product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete or archive listing by shopkeeper
// @route   DELETE /api/products/host/:id
// @access  Private (Owner / Shopkeeper)
exports.deleteHostListing = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product listing not found' });
    }

    // Verify ownership or admin
    if (product.ownerId && product.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    // Check if there are active bookings for this product
    const activeBooking = await Booking.findOne({
      productId: product._id,
      orderStatus: { $in: ['BOOKING_CONFIRMED', 'DISPATCHED', 'DELIVERED', 'RETURN_INSPECTION'] }
    });

    if (activeBooking) {
      return res.status(400).json({
        message: 'Cannot delete outfit with active or upcoming customer bookings. You can disable availability instead.'
      });
    }

    await Product.findByIdAndDelete(product._id);

    res.json({
      success: true,
      message: 'Outfit listing deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
