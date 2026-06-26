const OTP_CONFIG = {
  length: 6,
  expiryMinutes: 5,
  maxAttempts: 5,
  resendCooldownSeconds: 30,
};

module.exports = OTP_CONFIG;
