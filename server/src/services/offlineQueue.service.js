const mongoose = require('mongoose');
const { AppError } = require('../middleware/errorHandler');

/**
 * OfflineQueue Schema — persists queued operations for offline mode
 */
const offlineQueueSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  deviceId: {
    type: String,
    index: true,
  },
  operation: {
    type: String,
    required: true,
    enum: [
      'create_booking', 'cancel_booking', 'check_in', 'check_out',
      'scan_qr', 'start_task', 'complete_task', 'update_location',
      'report_issue', 'send_message', 'update_attendance',
    ],
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued',
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  maxRetries: {
    type: Number,
    default: 3,
  },
  lastError: {
    type: String,
  },
  priority: {
    type: Number,
    default: 0, // Higher = processed first
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

offlineQueueSchema.index({ status: 1, priority: -1, createdAt: 1 });
offlineQueueSchema.index({ userId: 1, status: 1 });

const OfflineQueueModel = mongoose.model('OfflineQueue', offlineQueueSchema);

class OfflineQueueService {
  /**
   * Enqueue an operation for offline processing
   */
  async enqueue({ userId, deviceId, operation, payload, priority = 0 }) {
    if (!userId) throw new AppError('UserId is required', 400, 'QUEUE_MISSING_USER');

    const queueItem = await OfflineQueueModel.create({
      userId,
      deviceId,
      operation,
      payload,
      priority,
    });

    return queueItem;
  }

  /**
   * Process all pending items for a user (called when app comes online)
   */
  async processUserQueue(userId, deviceId) {
    const query = { status: 'queued' };
    if (userId) query.userId = userId;
    if (deviceId) query.deviceId = deviceId;

    const items = await OfflineQueueModel.find(query)
      .sort({ priority: -1, createdAt: 1 })
      .limit(50);

    const results = [];

    for (const item of items) {
      try {
        item.status = 'processing';
        await item.save();

        const result = await this._processItem(item);
        item.status = 'completed';
        item.processedAt = new Date();
        await item.save();

        results.push({
          queueId: item._id,
          operation: item.operation,
          status: 'completed',
          result,
        });
      } catch (error) {
        item.retryCount += 1;
        item.lastError = error.message;

        if (item.retryCount >= item.maxRetries) {
          item.status = 'failed';
        } else {
          item.status = 'queued';
        }

        await item.save();

        results.push({
          queueId: item._id,
          operation: item.operation,
          status: item.status,
          error: error.message,
        });
      }
    }

    return {
      processed: results.filter(r => r.status === 'completed').length,
      failed: results.filter(r => r.status === 'failed').length,
      remaining: results.filter(r => r.status === 'queued').length,
      results,
    };
  }

  /**
   * Get pending queue count for a user
   */
  async getQueueCount(userId) {
    return OfflineQueueModel.countDocuments({
      userId,
      status: 'queued',
    });
  }

  /**
   * Get all pending items for a user
   */
  async getUserQueue(userId, { page = 1, limit = 20 } = {}) {
    const query = { userId, status: { $in: ['queued', 'failed'] } };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      OfflineQueueModel.find(query)
        .sort({ priority: -1, createdAt: 1 })
        .skip(skip)
        .limit(limit),
      OfflineQueueModel.countDocuments(query),
    ]);

    return {
      data: items,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Clear completed queue items (cleanup)
   */
  async clearCompleted(olderThanHours = 24) {
    const cutoff = new Date(Date.now() - olderThanHours * 3600000);
    const result = await OfflineQueueModel.deleteMany({
      status: { $in: ['completed', 'failed'] },
      createdAt: { $lt: cutoff },
    });
    return { deletedCount: result.deletedCount };
  }

  /**
   * Process a single queue item by delegating to the appropriate service
   */
  async _processItem(item) {
    // This is a delegation pattern — map operations to their service methods
    const serviceMap = {
      create_booking: async (payload) => {
        const bookingService = require('./booking.service');
        return bookingService.create(payload, payload.idempotencyKey);
      },
      cancel_booking: async (payload) => {
        const bookingService = require('./booking.service');
        return bookingService.cancel(payload.bookingId, payload.reason);
      },
      check_in: async (payload) => {
        const attendanceService = require('./attendance.service');
        return attendanceService.checkIn(payload.cleanerId, payload);
      },
      check_out: async (payload) => {
        const attendanceService = require('./attendance.service');
        return attendanceService.checkOut(payload.cleanerId, payload);
      },
      scan_qr: async (payload) => {
        const qrService = require('./qr.service');
        return qrService.scan(payload.code, payload.cleanerId);
      },
      start_task: async (payload) => {
        const taskService = require('./task.service');
        return taskService.startTask(payload.taskId);
      },
      complete_task: async (payload) => {
        const taskService = require('./task.service');
        return taskService.completeTask(payload.taskId, payload);
      },
      update_location: async (payload) => {
        const geoService = require('./geo.service');
        return geoService.updateCleanerLocation(payload.cleanerId, payload);
      },
    };

    const processor = serviceMap[item.operation];
    if (!processor) {
      throw new Error(`No processor for operation: ${item.operation}`);
    }

    return processor(item.payload);
  }

  /**
   * Get queue stats
   */
  async getStats() {
    const [queued, processing, completed, failed] = await Promise.all([
      OfflineQueueModel.countDocuments({ status: 'queued' }),
      OfflineQueueModel.countDocuments({ status: 'processing' }),
      OfflineQueueModel.countDocuments({ status: 'completed' }),
      OfflineQueueModel.countDocuments({ status: 'failed' }),
    ]);
    return { queued, processing, completed, failed, total: queued + processing + completed + failed };
  }
}

module.exports = new OfflineQueueService();
