const authService = require('../services/auth.service');
const otpService = require('../services/otp.service');
const tokenBlacklist = require('../services/tokenBlacklist.service');
const { AppError } = require('../middleware/errorHandler');

const authController = {
  /**
   * POST /api/v1/auth/send-otp
   * Send OTP to phone number
   */
  sendOtp: async (req, res, next) => {
    try {
      const { phone } = req.body;
      const result = await authService.sendOtp(phone);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/verify-otp
   * Verify OTP and login/register
   */
  verifyOtp: async (req, res, next) => {
    try {
      const { phone, otp } = req.body;
      const result = await authService.loginWithOtp(phone, otp);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/register
   * Register new customer with phone + OTP
   */
  register: async (req, res, next) => {
    try {
      const { phone, name, email } = req.body;
      const result = await authService.register({ phone, name, email });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/register-cleaner
   * Register new cleaner with phone, password, and documents
   */
  registerCleaner: async (req, res, next) => {
    try {
      // Import here to avoid circular dependency if any
      const cleanerService = require('../services/cleaner.service');
      // Pass the entire body to cleanerService.create
      const cleaner = await cleanerService.create(req.body);
      res.status(201).json({ success: true, data: cleaner });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/login
   * Login with phone + password
   */
  login: async (req, res, next) => {
    try {
      const { phone, password } = req.body;
      const result = await authService.loginWithPassword(phone, password);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token with rotation
   */
  refresh: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      // Pass old access token for rotation/blacklisting
      const authHeader = req.headers.authorization;
      const oldToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
      const result = await authService.refreshToken(refreshToken, oldToken);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/logout
   * Logout and invalidate tokens (MongoDB-persisted blacklist + rotation)
   */
  logout: async (req, res, next) => {
    try {
      const result = await authService.logout(req.userId, req.token);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/auth/profile
   * Get current user profile
   */
  getProfile: async (req, res, next) => {
    try {
      const profile = await authService.getProfile(req.userId, req.userRole);
      const user = { id: req.userId, role: req.userRole, phone: req.user.phone };
      res.status(200).json({ success: true, data: { user, profile } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/set-password
   * Set password after OTP verification
   */
  setPassword: async (req, res, next) => {
    try {
      const { password } = req.body;
      const result = await authService.setPassword(req.userId, password);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/change-password
   * Change password (requires current password)
   */
  changePassword: async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.userId, currentPassword, newPassword);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
