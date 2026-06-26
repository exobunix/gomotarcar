const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      sub: payload.userId,
      role: payload.role,
      ...(payload.cleanerId && { cleanerId: payload.cleanerId }),
      ...(payload.supervisorId && { supervisorId: payload.supervisorId }),
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiry }
  );
};

const generateRefreshToken = (payload) => {
  return jwt.sign(
    { sub: payload.userId, tokenVersion: payload.tokenVersion || 1 },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiry }
  );
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwtRefreshSecret);
};

const generateTokenPair = (payload) => ({
  accessToken: generateAccessToken(payload),
  refreshToken: generateRefreshToken(payload),
  expiresIn: config.jwtExpiry,
});

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateTokenPair,
};
