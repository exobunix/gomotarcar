const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const tokenBlacklist = require('../services/tokenBlacklist.service');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_NO_TOKEN', message: 'Access token is required' }
      });
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted (MongoDB-persisted, async)
    const isBlacklisted = await tokenBlacklist.isBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_TOKEN_REVOKED', message: 'Token has been revoked' }
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await User.findById(decoded.sub).select('-passwordHash -refreshToken');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_USER_INACTIVE', message: 'User account is inactive or not found' }
      });
    }

    req.user = {
      id: user._id,
      role: user.role,
      phone: user.phone,
      isVerified: user.isVerified,
    };
    req.userId = user._id;
    req.userRole = user.role;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_TOKEN_EXPIRED', message: 'Access token has expired' }
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_INVALID_TOKEN', message: 'Invalid access token' }
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'AUTH_ERROR', message: 'Authentication error' }
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.sub).select('-passwordHash -refreshToken');
      if (user && user.isActive) {
        req.user = { id: user._id, role: user.role, phone: user.phone };
        req.userId = user._id;
        req.userRole = user.role;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { authenticate, optionalAuth };
