const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  cleanerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cleaner', required: true },
  date: { type: Date, required: true },
  checkIn: {
    time: Date,
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number],
    },
    address: String,
    selfieUrl: String,
    isLate: { type: Boolean, default: false },
    lateMinutes: { type: Number, default: 0 },
    isGPSVerified: { type: Boolean, default: false },
    ip: String,
    deviceId: String,
  },
  checkOut: {
    time: Date,
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number],
    },
    address: String,
    selfieUrl: String,
    isEarly: { type: Boolean, default: false },
    earlyMinutes: { type: Number, default: 0 },
  },
  summary: {
    totalWorkingMinutes: { type: Number, default: 0 },
    effectiveWorkingMinutes: { type: Number, default: 0 },
    overtimeMinutes: { type: Number, default: 0 },
    breaks: [{
      startTime: Date,
      endTime: Date,
      duration: Number,
      reason: String,
    }],
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day', 'late', 'leave', 'holiday'],
    default: 'absent',
  },
  modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  modificationReason: String,
  originalStatus: String,
  modifiedAt: Date,
}, { timestamps: true });

attendanceSchema.index({ cleanerId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
