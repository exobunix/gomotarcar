const { Server } = require('socket.io');
const config = require('../config/env');
const jwt = require('jsonwebtoken');
const Cleaner = require('../models/Cleaner');
const User = require('../models/User');

let io = null;

const initializeSocket = (httpServer) => {
  const emitter = require('./emitter');
  io = new Server(httpServer, {
    cors: {
      origin: config.socketConfig?.corsOrigins || config.corsOrigins,
      credentials: true,
    },
    pingTimeout: config.socketConfig?.pingTimeout || 30000,
    pingInterval: config.socketConfig?.pingInterval || 15000,
    maxHttpBufferSize: config.socketConfig?.maxPayloadSize || 1e6,
    transports: ['websocket', 'polling'],
  });

  // Auth middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.userId = decoded.sub;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`Socket connected: ${socket.userId} (${socket.userRole})`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Join role-specific room
    socket.join(`role:${socket.userRole}`);

    // Resolve cleaner ID if the user is a cleaner
    if (socket.userRole === 'cleaner') {
      try {
        const cleaner = await Cleaner.findOne({ userId: socket.userId });
        if (cleaner) {
          socket.cleanerId = cleaner._id;
          socket.cleanerIdCode = cleaner.cleanerId;
          socket.join(`cleaner:${cleaner._id}`);
          if (cleaner.assignedZone) {
            socket.assignedZone = cleaner.assignedZone;
            socket.join(`zone:${cleaner.assignedZone}`);
          }
        }
      } catch (err) {
        console.error('Failed to resolve cleaner:', err.message);
      }
    }

    // Join franchise room
    if (socket.userRole === 'franchise') {
      try {
        const Franchise = require('../models/Franchise');
        const franchise = await Franchise.findOne({ userId: socket.userId });
        if (franchise) {
          socket.join(`franchise:${franchise._id}`);
          socket.franchiseId = franchise._id;
        }
      } catch (err) {
        console.error('Failed to resolve franchise:', err.message);
      }
    }

    // Join supervisor room
    if (socket.userRole === 'supervisor') {
      const Supervisor = require('../models/Supervisor');
      const supervisor = await Supervisor.findOne({ userId: socket.userId });
      if (supervisor && supervisor.assignedZone) {
        socket.join(`zone:${supervisor.assignedZone}`);
        socket.assignedZone = supervisor.assignedZone;
      }
    }

    // Initialize all event handlers
    const taskHandler = require('./task.handler');
    const locationHandler = require('./location.handler');
    const trackingHandler = require('./tracking.handler');
    const chatHandler = require('./chat.handler');
    const notificationHandler = require('./notification.handler');
    const attendanceHandler = require('./attendance.handler');
    const bookingHandler = require('./booking.handler');

    taskHandler(io, socket);
    locationHandler(io, socket);
    trackingHandler(io, socket);
    chatHandler(io, socket);
    notificationHandler(io, socket);
    attendanceHandler(io, socket);
    bookingHandler(io, socket);

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.userId}`);

      // Set cleaner offline on disconnect
      if (socket.cleanerId) {
        try {
          const { CleanerLiveLocation } = require('../models/Tracking');
          await CleanerLiveLocation.findOneAndUpdate(
            { cleanerId: socket.cleanerId },
            { isOnline: false, lastUpdated: new Date() }
          );
          io.emit('cleaner:offline', {
            cleanerId: socket.cleanerId,
            timestamp: new Date(),
          });
        } catch (err) {
          console.error('Failed to set cleaner offline:', err.message);
        }
      }
    });

    // Idle timeout handler — auto-disconnect idle sockets
    let idleTimer = null;
    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      const idleTimeout = config.socketConfig?.idleTimeoutMs || 7200000; // 2 hours default
      idleTimer = setTimeout(() => {
        socket.emit('session:timeout', { reason: 'Session idle timeout', timeoutMinutes: idleTimeout / 60000 });
        socket.disconnect(true);
      }, idleTimeout);
    };
    resetIdleTimer();

    // Reset idle timer on any activity
    ['location:update', 'task:assign', 'booking:status-update', 'chat:send', 'disconnect'].forEach(event => {
      socket.prependAny(() => resetIdleTimer());
    });

    // Error handler
    socket.on('error', (err) => {
      console.error(`Socket error (${socket.userId}):`, err.message);
      // Don't crash on errors — just log and continue
    });

    // Handle reconnection status
    socket.on('reconnect_attempt', (attempt) => {
      console.log(`Socket reconnection attempt ${attempt} for ${socket.userId}`);
    });
  });

  // Initialize the centralized emitter
  emitter.initialize(getIO);

  console.log('Socket.IO initialized with all handlers');
  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

/**
 * Emit an event to a specific user
 */
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Emit an event to a role room
 */
const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

/**
 * Emit an event to a cleaner
 */
const emitToCleaner = (cleanerId, event, data) => {
  if (io) {
    io.to(`cleaner:${cleanerId}`).emit(event, data);
  }
};

/**
 * Emit an event to a zone
 */
const emitToZone = (zoneId, event, data) => {
  if (io) {
    io.to(`zone:${zoneId}`).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToRole,
  emitToCleaner,
  emitToZone,
};
