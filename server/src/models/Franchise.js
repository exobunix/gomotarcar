const mongoose = require('mongoose');

const franchiseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  franchiseName: {
    type: String,
    required: true,
    trim: true,
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  address: {
    street: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String },
    coordinates: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  type: {
    type: String,
    enum: ['workshop', 'service_center', 'cleaning_station'],
    default: 'cleaning_station',
  },
  servicesOffered: [{
    type: String,
  }],
  serviceZones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
  }],
  agreement: {
    documentUrl: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    commissionPercent: { type: Number, default: 10 },
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  documents: [{
    type: { type: String },
    fileUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verifiedAt: { type: Date },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  stats: {
    totalRevenue: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
  },
  bankDetails: {
    accountHolder: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    upiId: { type: String },
  },
}, {
  timestamps: true,
});

franchiseSchema.index({ userId: 1 });
franchiseSchema.index({ verificationStatus: 1 });
franchiseSchema.index({ 'address.coordinates': '2dsphere' });

module.exports = mongoose.model('Franchise', franchiseSchema);
