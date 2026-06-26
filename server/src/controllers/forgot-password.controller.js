const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { generateOTP, storeOTP, verifyOTP } = require('../services/otp.service');
const { generateTokenPair } = require('../utils/jwt');

const forgotPasswordController = {
  /**
   * POST /api/v1/auth/forgot-password
   * Send OTP to reset password
   */
  forgotPassword: async (req, res, next) => {
    try {
      const { phone } = req.body;
      const user = await User.findOne({ phone });
      if (!user) throw new AppError('Account not found with this phone number', 404, 'AUTH_USER_NOT_FOUND');

      const otp = generateOTP();
      const { expiresAt } = await storeOTP(phone, otp);
      console.log(`[ForgotPassword] OTP for ${phone}: ${otp}`); // In production, send via SMS

      res.status(200).json({
        success: true,
        data: { message: 'OTP sent for password reset', expiresAt },
      });
    } catch (error) { next(error); }
  },

  /**
   * POST /api/v1/auth/reset-password
   * Verify OTP and reset password
   */
  resetPassword: async (req, res, next) => {
    try {
      const { phone, otp, newPassword } = req.body;

      await verifyOTP(phone, otp);

      const user = await User.findOne({ phone }).select('+passwordHash');
      if (!user) throw new AppError('User not found', 404, 'AUTH_USER_NOT_FOUND');

      user.passwordHash = newPassword; // Will be hashed by pre-save hook
      user.tokenVersion += 1; // Invalidate all existing tokens
      await user.save();

      res.status(200).json({
        success: true,
        data: { message: 'Password reset successfully. Please login with your new password.' },
      });
    } catch (error) { next(error); }
  },
};

module.exports = forgotPasswordController;
