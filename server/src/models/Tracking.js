const mongoose = require('mongoose');

const trackingHistorySchema = new mongoose.Schema({
  cleanerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cleaner',
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  type: {
    type: String,
    enum: ['location_update', 'task_route', 'checkin', 'checkout'],
    default: 'location_update',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  speed: Number,
  heading: Number,
  accuracy: Number,
  batteryLevel: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

trackingHistorySchema.index({ cleanerId: 1, timestamp: -1 });
trackingHistorySchema.index({ 'location': '2dsphere' });
trackingHistorySchema.index({ taskId: 1 });
// TTL: 7 days for raw location data
trackingHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });

const cleanerLiveLocationSchema = new mongoose.Schema({
  cleanerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cleaner',
    required: true,
    unique: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  speed: Number,
  heading: Number,
  accuracy: Number,
  batteryLevel: Number,
  isOnline: {
    type: Boolean,
    default: false,
  },
  currentTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  assignedZone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

cleanerLiveLocationSchema.index({ 'location': '2dsphere' });
cleanerLiveLocationSchema.index({ isOnline: 1 });
cleanerLiveLocationSchema.index({ assignedZone: 1 });

module.exports = {
  TrackingHistory: mongoose.model('TrackingHistory', trackingHistorySchema),
  CleanerLiveLocation: mongoose.model('CleanerLiveLocation', cleanerLiveLocationSchema),
};
