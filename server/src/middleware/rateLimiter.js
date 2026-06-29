const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: message || 'Too many requests, please try again later',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const rateLimiters = {
  global: createRateLimiter(15 * 60 * 1000, 200, 'Too many requests'),
  auth: createRateLimiter(15 * 60 * 1000, 50, 'Too many login attempts'),
  otp: createRateLimiter(5 * 60 * 1000, 10, 'Too many OTP requests'),
  api: createRateLimiter(1 * 60 * 1000, 120, 'API rate limit exceeded'),
  strict: createRateLimiter(1 * 60 * 1000, 60, 'Too many requests'),
};

module.exports = { createRateLimiter, rateLimiters };
