const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicleNumber: { type: String, required: true, uppercase: true, trim: true },
  model: { type: String, required: true },
  make: { type: String, required: true },
  year: { type: Number },
  color: { type: String },
  fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'cng'] },
  vehicleType: { type: String, enum: ['hatchback', 'sedan', 'suv', 'luxury', 'ev'] },
  photo: { type: String },
  qrCode: {
    code: String,
    qrImageUrl: String,
    status: { type: String, enum: ['pending_activation', 'active', 'replaced', 'damaged'], default: 'pending_activation' },
    issuedAt: Date,
    lastReplacedAt: Date,
  },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  packageType: { type: String, enum: ['basic', 'premium', 'elite'] },
  totalCleanings: { type: Number, default: 0 },
  lastCleaning: { type: Date },
  rcVerified: { type: Boolean, default: false },
  pucExpiry: { type: Date },
  challans: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  cleaningHistory: [{
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    date: Date,
    cleanerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cleaner' },
    cleanerName: String,
    packageType: String,
    status: String,
  }],
}, { timestamps: true });

vehicleSchema.index({ vehicleNumber: 1 });
vehicleSchema.index({ customerId: 1 });
vehicleSchema.index({ 'qrCode.code': 1 });
vehicleSchema.index({ subscriptionId: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
