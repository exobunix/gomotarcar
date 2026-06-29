const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const { v4: uuidv4 } = require('uuid');
const config = require('./config/env');
const { rateLimiters } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// Request ID middleware — attach unique ID to every request for log correlation
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https:', 'data:'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xFrameOptions: { action: 'deny' },
}));

app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID', 'X-Platform', 'X-App-Version', 'X-CSRF-Token', 'X-Request-ID'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-Request-ID'],
}));

// Rate limiting
app.use('/api/', rateLimiters.api);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization
app.use(mongoSanitize());

// Logging — use 'combined' format in production for Apache-compatible logs
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Static files (for uploads)
app.use('/uploads', express.static('uploads'));

// Health check — enhanced with dependency checks
app.get('/health', async (req, res) => {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    dependencies: {},
  };

  // Check MongoDB connection
  try {
    const mongooseState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    checks.dependencies.mongodb = mongooseState === 1 ? 'connected' : 'disconnected';
    if (mongooseState !== 1) checks.status = 'degraded';
  } catch (err) {
    checks.dependencies.mongodb = 'error';
    checks.status = 'degraded';
  }

  // Check Redis connection
  try {
    const { getRedis } = require('./config/redis');
    const redis = getRedis();
    if (redis && redis.status === 'ready') {
      checks.dependencies.redis = 'connected';
    } else {
      checks.dependencies.redis = redis ? redis.status : 'not configured';
      if (redis && redis.status !== 'connecting') checks.status = 'degraded';
    }
  } catch (err) {
    checks.dependencies.redis = 'not configured';
  }

  const httpStatus = 200; // Always return 200 so Render doesn't kill the container
  res.status(httpStatus).json({
    success: checks.status === 'ok' || checks.status === 'degraded',
    data: checks,
  });
});

// API routes
app.use(config.apiPrefix, routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
