const config = require('../config/env');

class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'SYS_ERROR';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'SYS_INTERNAL_ERROR';
  let message = err.message || 'Internal server error';

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VAL_MONGOOSE_ERROR';
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(statusCode).json({
      success: false,
      error: { code, message: 'Validation failed', details },
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    code = 'VAL_DUPLICATE_KEY';
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
    return res.status(statusCode).json({
      success: false,
      error: { code, message, details: { field } },
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'VAL_INVALID_ID';
    message = `Invalid ${err.path}: ${err.value}`;
    return res.status(statusCode).json({
      success: false,
      error: { code, message },
    });
  }

  // MongoDB connection error
  if (err.name === 'MongoServerError') {
    statusCode = 503;
    code = 'SYS_DB_ERROR';
    message = 'Database service unavailable';
  }

  // JWT errors (caught elsewhere but just in case)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'AUTH_TOKEN_ERROR';
    message = 'Invalid or expired token';
  }

  // Log error
  if (config.nodeEnv === 'development') {
    console.error('Error:', {
      code,
      message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = { AppError, errorHandler };
