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
router.get('/temp-db-op', async (req, res, next) => {
  try {
    const email = "adarshdeepsachan@gmail.com";
    const User = require('../models/User');
    const Franchise = require('../models/Franchise');

    let user = await User.findOne({ email });
    let franchise = await Franchise.findOne({ email });

    const response = {
      userFound: !!user,
      franchiseFound: !!franchise,
      userDetails: user ? {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
      } : null,
      franchiseDetails: franchise ? {
        id: franchise._id,
        franchiseName: franchise.franchiseName,
        ownerName: franchise.ownerName,
        email: franchise.email,
        phone: franchise.phone,
      } : null
    };

    if (req.query.fix === 'true') {
      if (user) {
        user.role = 'franchise';
        user.isActive = true;
        user.isVerified = true;
        user.passwordHash = "Adarsh@12";
        await user.save();
        response.fixed = true;
        response.newDetails = {
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified
        };
      }
    }

    res.status(200).json({ success: true, data: response });
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

module.exports = router;
