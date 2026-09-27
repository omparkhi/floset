const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'floset_super_secret_jwt_key_2026_fashion_rental_platform',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user (customer, host, or shopkeeper)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, businessName, storeName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: cleanEmail }).select('+password');

    // Sanitize role: Only allow customer, host, shopkeeper (prevent admin self-registration)
    let assignedRole = 'customer';
    if (role === 'shopkeeper' || role === 'host') {
      assignedRole = role;
    }

    const isShopkeeper = assignedRole === 'shopkeeper';
    const isHostRole = assignedRole === 'host' || isShopkeeper;

    const hostDetails = isShopkeeper
      ? {
          type: 'STORE',
          businessName: businessName || storeName || `${name || 'Boutique'}'s Studio`,
          verified: false
        }
      : isHostRole
      ? {
          type: 'INDIVIDUAL',
          businessName: '',
          verified: false
        }
      : {};

    if (userExists) {
      // If user already exists as a customer and is registering as a shopkeeper with correct password, upgrade them!
      if (isShopkeeper && userExists.role === 'customer') {
        const passwordMatch = await userExists.matchPassword(password);
        if (passwordMatch) {
          userExists.role = 'shopkeeper';
          userExists.isHost = true;
          if (name) userExists.name = name;
          if (phone) userExists.phone = phone;
          userExists.hostDetails = hostDetails;
          await userExists.save();

          const token = generateToken(userExists._id);
          return res.status(200).json({
            _id: userExists._id,
            name: userExists.name,
            email: userExists.email,
            phone: userExists.phone,
            role: userExists.role,
            isHost: true,
            hasListings: false,
            hostDetails: userExists.hostDetails,
            token
          });
        }
      }
      return res.status(400).json({ message: 'User already exists with this email. Please sign in.' });
    }

    const user = await User.create({
      name: name || (isShopkeeper ? 'Boutique Partner' : 'Customer'),
      email: cleanEmail,
      password,
      phone: phone || '',
      role: assignedRole,
      isHost: isHostRole,
      hostDetails
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isHost: isHostRole,
      hasListings: false,
      hostDetails: user.hostDetails,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // If logging in via Shopkeeper portal and user is still registered as customer, auto-upgrade to shopkeeper
    if (role === 'shopkeeper' && user.role === 'customer') {
      user.role = 'shopkeeper';
      user.isHost = true;
      if (!user.hostDetails || !user.hostDetails.type) {
        user.hostDetails = {
          type: 'STORE',
          businessName: `${user.name}'s Boutique`,
          verified: false
        };
      }
      await user.save();
    }

    const token = generateToken(user._id);
    const listingCount = await Product.countDocuments({ ownerId: user._id });
    const isHost = Boolean(user.isHost || user.role === 'shopkeeper' || user.role === 'host' || listingCount > 0);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isHost,
      hasListings: listingCount > 0,
      hostDetails: user.hostDetails,
      savedAddresses: user.savedAddresses,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const listingCount = await Product.countDocuments({ ownerId: user._id });
    const isHost = Boolean(user.isHost || user.role === 'shopkeeper' || user.role === 'host' || listingCount > 0);
    const userObj = user.toObject();
    userObj.isHost = isHost;
    userObj.hasListings = listingCount > 0;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile / address / host details / upgrade role
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    if (req.body.role && ['shopkeeper', 'host', 'customer'].includes(req.body.role)) {
      user.role = req.body.role;
      if (req.body.role === 'shopkeeper' || req.body.role === 'host') {
        user.isHost = true;
      }
    }

    if (req.body.isHost !== undefined) {
      user.isHost = Boolean(req.body.isHost);
    }

    if (req.body.hostDetails) {
      user.hostDetails = { ...user.hostDetails, ...req.body.hostDetails };
    }

    if (req.body.savedAddresses) {
      user.savedAddresses = req.body.savedAddresses;
    }

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      isHost: updated.isHost,
      hostDetails: updated.hostDetails,
      savedAddresses: updated.savedAddresses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
