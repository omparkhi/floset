const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, please log in' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'floset_super_secret_jwt_key_2026_fashion_rental_platform'
    );
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role ${req.user?.role || 'Guest'} is not authorized for this resource`
      });
    }
    next();
  };
};

const optionalProtect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'floset_super_secret_jwt_key_2026_fashion_rental_platform'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // ignore invalid token in optional
    }
  }
  next();
};

module.exports = { protect, authorize, optionalProtect };
