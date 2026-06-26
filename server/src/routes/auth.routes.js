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
} = require('../validators/auth.validator');

// Public routes (with rate limiting)
router.post('/send-otp', rateLimiters.otp, validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', rateLimiters.otp, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/register', rateLimiters.auth, validate(registerSchema), authController.register);
router.post('/register-cleaner', rateLimiters.auth, authController.registerCleaner);
router.post('/login', rateLimiters.auth, validate(loginPasswordSchema), authController.login);
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
