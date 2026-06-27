const User = require('../models/User');
const Admin = require('../models/Admin');
const Cleaner = require('../models/Cleaner');
const Customer = require('../models/Customer');
const Supervisor = require('../models/Supervisor');
const Franchise = require('../models/Franchise');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const { generateOTP, storeOTP, verifyOTP, sendOTP } = require('./otp.service');
const { generateCleanerId } = require('../utils/helpers');
const { AppError } = require('../middleware/errorHandler');
const bcrypt = require('bcryptjs');

class AuthService {
  /**
   * Send OTP to phone number
   */
  async sendOtp(phone) {
    const otp = generateOTP();
    const { expiresAt } = await storeOTP(phone, otp);
    await sendOTP(phone, otp);

    return {
      message: 'OTP sent successfully',
      expiresAt,
    };
  }

  /**
   * Register new customer with phone + OTP
   */
  async register({ phone, name, email }) {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      throw new AppError('Phone number already registered', 409, 'AUTH_PHONE_EXISTS');
    }

    // Create user
    const user = await User.create({
      phone,
      email,
      role: 'customer',
      isVerified: true,
      phoneVerified: true,
    });

    // Create customer profile
    const nameParts = (name || '').split(' ');
    const customer = await Customer.create({
      userId: user._id,
      firstName: nameParts[0] || name,
      lastName: nameParts.slice(1).join(' ') || '',
      phone,
      email,
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user._id,
      role: 'customer',
    });

    // Store refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: { id: user._id, phone: user.phone, role: 'customer' },
      customer: { id: customer._id, firstName: customer.firstName, lastName: customer.lastName },
      tokens,
    };
  }

  /**
   * Login with phone + password
   */
  async loginWithPassword(phone, password) {
    const user = await User.findOne({ phone }).select('+passwordHash');
    if (!user) {
      throw new AppError('Invalid phone or password', 401, 'AUTH_INVALID_CREDENTIALS');
    }

    if (!user.passwordHash) {
      throw new AppError(
        'Password not set. Please use OTP login.',
        400,
        'AUTH_PASSWORD_NOT_SET'
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid phone or password', 401, 'AUTH_INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403, 'AUTH_ACCOUNT_INACTIVE');
    }

    return this._generateAuthResponse(user);
  }

  /**
   * Verify OTP and login/register
   */
  async loginWithOtp(phone, otp) {
    await verifyOTP(phone, otp);

    let user = await User.findOne({ phone });

    if (!user) {
      // Auto-register for new users
      user = await User.create({
        phone,
        role: 'customer',
        phoneVerified: true,
        isVerified: true,
      });

      await Customer.create({
        userId: user._id,
        firstName: 'User',
        phone,
      });
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403, 'AUTH_ACCOUNT_INACTIVE');
    }

    user.lastLogin = new Date();
    await user.save();

    return this._generateAuthResponse(user);
  }

  /**
   * Refresh access token with rotation (old token becomes invalid)
   */
  async refreshToken(refreshToken, oldToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.sub);

      if (!user || !user.isActive) {
        throw new AppError('Invalid refresh token', 401, 'AUTH_INVALID_REFRESH');
      }

      if (user.tokenVersion !== decoded.tokenVersion) {
        throw new AppError('Token revoked', 401, 'AUTH_TOKEN_REVOKED');
      }

      // Blacklist the old access token if provided (rotation)
      if (oldToken) {
        const tokenBlacklist = require('./tokenBlacklist.service');
        await tokenBlacklist.blacklist(oldToken, {
          userId: user._id,
          reason: 'refresh_rotation',
        });
      }

      const tokens = generateTokenPair({
        userId: user._id,
        role: user.role,
        tokenVersion: user.tokenVersion,
      });

      user.refreshToken = tokens.refreshToken;
      await user.save();

      return { tokens };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid or expired refresh token', 401, 'AUTH_INVALID_REFRESH');
    }
  }

  /**
   * Logout - invalidate refresh token and blacklist access token
   */
  async logout(userId, accessToken) {
    const user = await User.findById(userId);
    if (user) {
      // Blacklist the access token
      if (accessToken) {
        const tokenBlacklist = require('./tokenBlacklist.service');
        await tokenBlacklist.blacklist(accessToken, {
          userId: user._id,
          reason: 'logout',
        });
      }
      user.refreshToken = null;
      user.tokenVersion += 1;
      await user.save();
    }
    return { message: 'Logged out successfully' };
  }

  /**
   * Set password (after OTP verification)
   */
  async setPassword(userId, newPassword) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new AppError('User not found', 404, 'AUTH_USER_NOT_FOUND');
    }

    user.passwordHash = newPassword;
    await user.save();

    return { message: 'Password set successfully' };
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new AppError('User not found', 404, 'AUTH_USER_NOT_FOUND');
    }

    if (!user.passwordHash) {
      throw new AppError('No password set. Please set a password first.', 400, 'AUTH_NO_PASSWORD');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401, 'AUTH_WRONG_PASSWORD');
    }

    user.passwordHash = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  /**
   * Get user profile by role
   */
  async getProfile(userId, role) {
    let profile = null;

    switch (role) {
      case 'super_admin':
      case 'manager':
      case 'operations':
        profile = await Admin.findOne({ userId }).populate('userId', 'phone email');
        break;
      case 'supervisor':
        profile = await Supervisor.findOne({ userId }).populate('userId', 'phone email');
        break;
      case 'cleaner':
        profile = await Cleaner.findOne({ userId }).populate('userId', 'phone email');
        break;
      case 'franchise':
        profile = await Franchise.findOne({ userId }).populate('userId', 'phone email');
        break;
      case 'customer':
        profile = await Customer.findOne({ userId }).populate('userId', 'phone email');
        break;
      default:
        throw new AppError('Invalid role', 400, 'AUTH_INVALID_ROLE');
    }

    return profile;
  }

  /**
   * Generate auth response with user + tokens
   */
  async _generateAuthResponse(user) {
    user.lastLogin = new Date();

    const tokens = generateTokenPair({
      userId: user._id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Get role-specific profile
    let profile = null;
    try {
      profile = await this.getProfile(user._id, user.role);
    } catch (e) {
      // Profile not found, continue
    }

    if (user.role === 'cleaner' && profile) {
      if (profile.verificationStatus !== 'verified') {
        throw new AppError('Your account is pending admin approval', 403, 'AUTH_PENDING_APPROVAL');
      }
    }

    return {
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      profile,
      tokens,
    };
  }
}

module.exports = new AuthService();
