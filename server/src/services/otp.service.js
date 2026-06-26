const crypto = require('crypto');
const mongoose = require('mongoose');
const otpConfig = require('../config/otp');
const { AppError } = require('../middleware/errorHandler');

/**
 * OTP Schema for MongoDB-based OTP storage with TTL
 */
const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  maxAttempts: {
    type: Number,
    default: 5,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // TTL index - auto-delete on expiry
  },
  ipAddress: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const OTPModel = mongoose.model('OTP', otpSchema);

/**
 * Rate limiting - OTP requests per phone per window
 */
const phoneRateMap = new Map();
const IP_RATE_WINDOW_MS = 60000; // 1 minute
const MAX_OTP_PER_WINDOW = 3;

const generateOTP = () => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < otpConfig.length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
};

const validatePhone = (phone) => {
  // Phone must be 10-15 digits, optionally starting with +
  const phoneStr = String(phone).trim();
  if (!/^\+?[1-9]\d{9,14}$/.test(phoneStr)) {
    throw new AppError('Invalid phone number format', 400, 'AUTH_INVALID_PHONE');
  }
  return phoneStr;
};

const checkIPRateLimit = (ipAddress) => {
  if (!ipAddress) return;
  const now = Date.now();
  const windowStart = now - IP_RATE_WINDOW_MS;

  if (!phoneRateMap.has(ipAddress)) {
    phoneRateMap.set(ipAddress, []);
  }

  const timestamps = phoneRateMap.get(ipAddress).filter(t => t > windowStart);

  if (timestamps.length >= MAX_OTP_PER_WINDOW) {
    const oldest = timestamps[0];
    const waitMs = IP_RATE_WINDOW_MS - (now - oldest);
    throw new AppError(
      `Too many OTP requests. Please try again in ${Math.ceil(waitMs / 1000)} seconds.`,
      429,
      'AUTH_OTP_IP_LIMIT'
    );
  }

  timestamps.push(now);
  phoneRateMap.set(ipAddress, timestamps);

  // Cleanup old entries
  setTimeout(() => {
    const current = phoneRateMap.get(ipAddress) || [];
    phoneRateMap.set(ipAddress, current.filter(t => t > Date.now() - IP_RATE_WINDOW_MS));
  }, IP_RATE_WINDOW_MS);
};

const storeOTP = async (phone, otp, ipAddress) => {
  phone = validatePhone(phone);
  checkIPRateLimit(ipAddress);

  const now = new Date();

  // Check for existing unexpired OTP and enforce cooldown
  const existing = await OTPModel.findOne({
    phone,
    verified: false,
    expiresAt: { $gt: now },
  }).sort({ sentAt: -1 });

  if (existing) {
    const elapsedMs = now - existing.sentAt;
    if (elapsedMs < otpConfig.resendCooldownSeconds * 1000) {
      const remaining = Math.ceil(
        (otpConfig.resendCooldownSeconds * 1000 - elapsedMs) / 1000
      );
      throw new AppError(
        `Please wait ${remaining} seconds before requesting a new OTP`,
        429,
        'AUTH_OTP_COOLDOWN'
      );
    }
    // Expire existing OTP so it can't be verified after new one is sent
    existing.expiresAt = now;
    await existing.save();
  }

  const expiresAt = new Date(now.getTime() + otpConfig.expiryMinutes * 60 * 1000);

  const otpRecord = await OTPModel.create({
    phone,
    otp,
    attempts: 0,
    maxAttempts: otpConfig.maxAttempts || 5,
    sentAt: now,
    expiresAt,
    ipAddress,
  });

  return { expiresAt, otpId: otpRecord._id };
};

const verifyOTP = async (phone, otp) => {
  phone = validatePhone(phone);

  const record = await OTPModel.findOne({
    phone,
    verified: false,
    expiresAt: { $gt: new Date() },
  }).sort({ sentAt: -1 });

  if (!record) {
    throw new AppError('No OTP found. Please request a new OTP.', 400, 'AUTH_OTP_NOT_FOUND');
  }

  // Atomic increment of attempts
  record.attempts += 1;

  if (record.attempts > record.maxAttempts) {
    record.expiresAt = new Date(); // Expire immediately
    await record.save();
    throw new AppError(
      'Too many failed attempts. Please request a new OTP.',
      429,
      'AUTH_OTP_MAX_ATTEMPTS'
    );
  }

  // Constant-time comparison to prevent timing attacks
  if (record.otp.length !== otp.length || !crypto.timingSafeEqual(Buffer.from(record.otp), Buffer.from(otp))) {
    await record.save();
    throw new AppError('Invalid OTP. Please try again.', 400, 'AUTH_OTP_INVALID');
  }

  // Mark as verified
  record.verified = true;
  await record.save();

  return { verified: true };
};

const sendOTP = async (phone, otp) => {
  // In production, integrate with Twilio/MSG91
  console.log(`[OTP] Sending OTP to phone ${phone}`);
  return { sent: true };
};

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  sendOTP,
  OTPModel,
};
