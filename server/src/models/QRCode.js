const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
  scannedAt: { type: Date, default: Date.now },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  role: String,
  ip: String,
  device: String,
  location: {
    lat: Number,
    lng: Number,
  },
  success: { type: Boolean, default: true },
  errorMessage: String,
}, { _id: false });

const qrSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  name: { type: String, default: '' },
  purpose: { type: String, default: '' },
  type: { type: String, default: 'Car' },
  location: { type: String, default: 'Bangalore' },
  qrImageUrl: { type: String, default: '' },
  qrSvgContent: { type: String, default: '' },
  status: { type: String, enum: ['pending_activation', 'active', 'replaced', 'damaged', 'expired'], default: 'pending_activation' },
  version: { type: Number, default: 1 },
  issuedAt: { type: Date, default: Date.now },
  activatedAt: Date,
  replacedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'QRCode' },
  replacementReason: String,
  replacedAt: Date,
  scannedCount: { type: Number, default: 0 },
  uniqueScans: { type: Number, default: 0 },
  lastScannedAt: Date,
  lastScannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scanHistory: [scanHistorySchema],
  expiresAt: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

qrSchema.index({ code: 1 });
qrSchema.index({ vehicleId: 1 });
qrSchema.index({ status: 1 });
qrSchema.index({ 'scanHistory.scannedAt': -1 });

module.exports = mongoose.model('QRCode', qrSchema);
