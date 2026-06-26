const crypto = require('crypto');

const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
};

const generateOTPExpiry = (minutes = 5) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

const isOTPExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};

module.exports = { generateOTP, generateOTPExpiry, isOTPExpired };
