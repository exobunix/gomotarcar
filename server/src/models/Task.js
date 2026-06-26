const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskId: { type: String, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  cleanerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cleaner' },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String },
  timeSlot: { type: String, enum: ['morning', 'afternoon', 'evening'] },
  actualStartTime: { type: Date },
  actualEndTime: { type: Date },
  packageType: { type: String, enum: ['basic', 'premium', 'elite'] },
  cleaningType: { type: String },
  services: [{
    item: String,
    label: String,
    completed: { type: Boolean, default: false },
    completedAt: Date,
  }],
  status: {
    type: String,
    enum: ['assigned', 'in_progress', 'completed', 'missed', 'cancelled'],
    default: 'assigned',
  },
  beforePhotos: [String],
  afterPhotos: [String],
  qrVerified: { type: Boolean, default: false },
  qrScannedAt: Date,
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: [Number],
  },
  specialInstructions: { type: String },
  hasIssue: { type: Boolean, default: false },
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  customerPaymentStatus: { type: String, enum: ['paid', 'pending'], default: 'pending' },
  cleanerEarnings: { type: Number, default: 0 },
  incentiveEligible: { type: Boolean, default: false },
  incentiveEarned: { type: Number, default: 0 },
  reviewed: { type: Boolean, default: false },
  reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    remark: String,
  }],
}, { timestamps: true });

taskSchema.index({ taskId: 1 });
taskSchema.index({ cleanerId: 1, scheduledDate: -1 });
taskSchema.index({ customerId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ scheduledDate: -1 });
taskSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Task', taskSchema);
