// Restart comment trigger
// Trigger comment
const mongoose = require("mongoose");
const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const http = require('http');

let server;

// Gracefully initialize services — non-critical failures don't crash the server
const safelyInitialize = (name, initFn) => {
  try {
    const result = initFn();
    if (result && typeof result.catch === 'function') {
      return result.catch(err => {
        logger.warn(`Service "${name}" initialized with warning: ${err.message}`);
        return null;
      });
    }
    logger.info(`Service "${name}" initialized successfully`);
    return result;
  } catch (err) {
    logger.warn(`Service "${name}" failed to initialize: ${err.message}`);
    logger.warn(`  → The server will continue running without "${name}"`);
    logger.warn(`  → Fix the configuration in server/.env and restart`);
    return null;
  }
};

const startServer = async () => {
  try {
    // Connect to MongoDB (critical — exit if this fails)
    await connectDB();

    // Initialize services (non-critical — continue on failure)
    safelyInitialize('Firebase', () => {
      const { initializeFirebase } = require('./config/firebase');
      initializeFirebase();
    });

    safelyInitialize('Razorpay', () => {
      const { initializeRazorpay } = require('./config/razorpay');
      initializeRazorpay();
    });

    safelyInitialize('Redis', () => {
      const { initializeRedis } = require('./config/redis');
      initializeRedis();
    });

    safelyInitialize('S3', () => {
      const { initializeS3 } = require('./config/s3');
      initializeS3();
    });

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Initialize Socket.IO
    safelyInitialize('Socket.IO', () => {
      const { initializeSocket } = require('./socket');
      const io = initializeSocket(httpServer);
      app.set('io', io);
    });

    // Auto-seed database if empty
    safelyInitialize('Database Seed', async () => {
      const Settings = require('./models/Settings');
      const settingsCount = await Settings.countDocuments();
      if (settingsCount === 0) {
        logger.info('Database appears empty — seeding...');
        const { seed } = require('./seed');
        await seed();
        logger.info('Database seeded successfully');
      }
    });

    // Auto-seed CMS content if empty (runs after main seed)
    safelyInitialize('CMS Seed', async () => {
      const Banner = require('./models/Banner');
      const bannerCount = await Banner.countDocuments();
      if (bannerCount === 0) {
        logger.info('CMS collections empty — seeding CMS data...');
        const { seedCMS } = require('./seed-cms');
        await seedCMS();
        logger.info('CMS data seeded successfully');
      }
    });

    // Initialize cron jobs
    safelyInitialize('Cron Jobs', () => {
      const { initializeCronJobs } = require('./jobs');
      initializeCronJobs();
    });

    // Start listening
    server = httpServer.listen(config.port, () => {
      logger.info(`
  🚗 GoMotarCar API Server
     Environment: ${config.nodeEnv}
     Port: ${config.port}
     API: http://localhost:${config.port}${config.apiPrefix}
     Health: http://localhost:${config.port}/health
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      mongoose.connection.close(false).then(() => {
        logger.info('MongoDB connection closed');
        process.exit(0);
      }).catch(err => {
        logger.error('Error closing MongoDB connection:', err);
        process.exit(1);
      });
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();
