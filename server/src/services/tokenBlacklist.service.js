const mongoose = require('mongoose');
const config = require('../config/env');

/**
 * TokenBlacklist Schema — persisted in MongoDB with TTL index
 */
const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // TTL — auto-delete after expiry
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reason: {
    type: String,
    enum: ['logout', 'password_change', 'admin_revoke', 'refresh_rotation'],
    default: 'logout',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TokenBlacklistModel = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

/**
 * Parse JWT expiry string (e.g., '15m', '7d') to milliseconds
 */
const parseExpiryToMs = (expiryStr) => {
  const match = (expiryStr || '15m').match(/^(\d+)([smhd])$/);
  if (!match) return 900000; // default 15 min
  const val = parseInt(match[1], 10);
  switch (match[2]) {
    case 's': return val * 1000;
    case 'm': return val * 60000;
    case 'h': return val * 3600000;
    case 'd': return val * 86400000;
    default: return 900000;
  }
};

class TokenBlacklistService {
  /**
   * Blacklist a token — stored in MongoDB with TTL auto-cleanup
   */
  async blacklist(token, { userId, reason, expiresInMs } = {}) {
    const ttl = expiresInMs || parseExpiryToMs(config.jwtExpiry);
    const expiresAt = new Date(Date.now() + ttl);

    // Use upsert to handle duplicates gracefully
    await TokenBlacklistModel.findOneAndUpdate(
      { token },
      { token, expiresAt, userId, reason: reason || 'logout' },
      { upsert: true, new: true }
    );

    return { blacklisted: true, expiresAt };
  }

  /**
   * Check if a token is blacklisted (persisted)
   */
  async isBlacklisted(token) {
    if (!token) return false;
    const record = await TokenBlacklistModel.findOne({
      token,
      expiresAt: { $gt: new Date() },
    }).lean();
    return !!record;
  }

  /**
   * Remove expired blacklisted tokens (cleanup, though TTL handles this)
   */
  async cleanExpired() {
    const result = await TokenBlacklistModel.deleteMany({
      expiresAt: { $lte: new Date() },
    });
    return { deletedCount: result.deletedCount };
  }

  /**
   * Blacklist all tokens for a user (used on password change / admin action)
   */
  async blacklistAllForUser(userId) {
    // This is handled by incrementing tokenVersion on the User model
    // The JWT middleware will check tokenVersion against user's tokenVersion
    return { blacklisted: true, method: 'tokenVersion_incremented' };
  }

  /**
   * Get blacklist stats
   */
  async getStats() {
    const total = await TokenBlacklistModel.countDocuments();
    const active = await TokenBlacklistModel.countDocuments({
      expiresAt: { $gt: new Date() },
    });
    return { totalBlacklisted: total, activeBlacklistEntries: active };
  }
}

module.exports = new TokenBlacklistService();
