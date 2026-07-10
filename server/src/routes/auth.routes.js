const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { rateLimiters } = require('../middleware/rateLimiter');
const forgotPasswordController = require('../controllers/forgot-password.controller');
const {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  loginPasswordSchema,
  refreshTokenSchema,
  setPasswordSchema,
  changePasswordSchema,
  googleLoginSchema,
} = require('../validators/auth.validator');

// Public routes (with rate limiting)
router.post('/send-otp', rateLimiters.otp, validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', rateLimiters.otp, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/register', rateLimiters.auth, validate(registerSchema), authController.register);
router.post('/register-cleaner', rateLimiters.auth, authController.registerCleaner);
router.post('/register-franchise', rateLimiters.auth, validate(require('../validators/franchise.validator').createFranchiseSchema), async (req, res, next) => {
  try {
    const franchiseService = require('../services/franchise.service');
    const franchise = await franchiseService.create(req.body);
    res.status(201).json({ success: true, data: franchise });
  } catch (error) {
    next(error);
  }
});

router.post('/login', rateLimiters.auth, validate(loginPasswordSchema), authController.login);
router.post('/google-login', rateLimiters.auth, validate(googleLoginSchema), authController.googleLogin);
router.post('/refresh', rateLimiters.auth, validate(refreshTokenSchema), authController.refresh);

// Public routes (forgot/reset password)
router.post('/forgot-password', rateLimiters.otp, forgotPasswordController.forgotPassword);
router.post('/reset-password', rateLimiters.otp, forgotPasswordController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.post('/set-password', authenticate, validate(setPasswordSchema), authController.setPassword);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

router.get('/temp-inspect-database', async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const User = require('../models/User');
    const Franchise = require('../models/Franchise');
    const ServiceBooking = require('../models/ServiceBooking');
    const Customer = require('../models/Customer');
    const Vehicle = require('../models/Vehicle');
    const Cleaner = require('../models/Cleaner');
    const Zone = require('../models/Zone');
    const Attendance = require('../models/Attendance');

    const email = 'adarshdeepsachan@gmail.com';
    const user = await User.findOne({ email });
    const franchise = user ? await Franchise.findOne({ userId: user._id }) : null;
    const franchiseId = franchise ? franchise._id : null;

    const counts = {
      users: await User.countDocuments(),
      franchises: await Franchise.countDocuments(),
      bookings: await ServiceBooking.countDocuments(),
      bookingsForFranchise: franchiseId ? await ServiceBooking.countDocuments({ franchiseId }) : 0,
      customers: await Customer.countDocuments(),
      vehicles: await Vehicle.countDocuments(),
      cleaners: await Cleaner.countDocuments(),
      cleanersForFranchise: franchise ? await Cleaner.countDocuments({ assignedZone: { $in: franchise.serviceZones || [] } }) : 0,
      zones: await Zone.countDocuments(),
      attendance: await Attendance.countDocuments()
    };

    res.status(200).json({
      success: true,
      data: {
        franchiseId,
        franchiseName: franchise ? franchise.franchiseName : null,
        serviceZones: franchise ? franchise.serviceZones : [],
        counts
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
