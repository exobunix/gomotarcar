const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const missing = requiredEnvVars.filter(v => !process.env[v]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  socketPort: parseInt(process.env.SOCKET_PORT, 10) || 5000,
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  // MongoDB
  mongodbUri: process.env.MONGODB_URI,

  // JWT (supports both JWT_EXPIRES_IN and JWT_EXPIRY naming)
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiry: process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRES_IN || process.env.JWT_REFRESH_EXPIRY || '30d',

  // Firebase
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,

  // Razorpay
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,

  // AWS S3 (supports both S3_* and AWS_* naming)
  s3AccessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID,
  s3SecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY,
  s3Bucket: process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET || 'gomotarcar-uploads',
  s3Region: process.env.AWS_REGION || process.env.S3_REGION || 'ap-south-1',
  s3Endpoint: process.env.S3_ENDPOINT,

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // SMS
  smsProvider: process.env.SMS_PROVIDER || 'twilio',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,

  // Email
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT, 10) || 587,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  emailFrom: process.env.EMAIL_FROM || 'noreply@gomotarcar.com',

  // Encryption
  encryptionKey: process.env.ENCRYPTION_KEY,
  encryptionIv: process.env.ENCRYPTION_IV,

  // CORS
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000'],

  // Admin
  adminPanelUrl: process.env.ADMIN_PANEL_URL || 'http://localhost:3000',

  // Socket
  socketConfig: {
    corsOrigins: (process.env.SOCKET_CORS_ORIGINS || process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
    maxBufferSize: Math.min(
      parseInt(process.env.SOCKET_MAX_BUFFER, 10) || 1e6,
      5e5 // Hard cap at 500KB per message
    ),
    pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT, 10) || 30000,
    pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL, 10) || 15000,
    maxPayloadSize: Math.min(
      parseInt(process.env.SOCKET_MAX_PAYLOAD, 10) || 1e6,
      1e6 // Hard cap at 1MB per message
    ),
    idleTimeoutMs: parseInt(process.env.SOCKET_IDLE_TIMEOUT, 10) || 7200000, // 2 hours
  },
};
