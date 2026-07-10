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

router.get('/temp-populate-franchise-data', async (req, res, next) => {
  try {
    const User = require('../models/User');
    const Franchise = require('../models/Franchise');
    const ServiceBooking = require('../models/ServiceBooking');
    const Zone = require('../models/Zone');
    const Cleaner = require('../models/Cleaner');

    const email = 'adarshdeepsachan@gmail.com';
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let franchise = await Franchise.findOne({ userId: user._id });
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }

    const zones = await Zone.find({});
    const zoneIds = zones.map(z => z._id);

    // 1. Assign all zones to the franchise
    franchise.serviceZones = zoneIds;
    franchise.verificationStatus = 'verified';
    franchise.isActive = true;
    await franchise.save();

    // 2. Link all cleaners to the first zone if they don't have one, or make sure they have a zone from zoneIds
    let cleanerUpdateResult = { n: 0, nModified: 0 };
    if (zoneIds.length > 0) {
      cleanerUpdateResult = await Cleaner.updateMany(
        { $or: [{ assignedZone: { $exists: false } }, { assignedZone: null }] },
        { $set: { assignedZone: zoneIds[0] } }
      );
    }

    // 3. Link all bookings to this franchise
    const bookingUpdateResult = await ServiceBooking.updateMany(
      {},
      { $set: { franchiseId: franchise._id } }
    );

    res.status(200).json({
      success: true,
      message: 'Franchise data populated successfully',
      data: {
        franchiseName: franchise.franchiseName,
        franchiseId: franchise._id,
        zonesCount: zoneIds.length,
        cleanersUpdated: cleanerUpdateResult,
        bookingsUpdated: bookingUpdateResult
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
