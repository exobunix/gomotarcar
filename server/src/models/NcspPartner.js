const mongoose = require('mongoose');

const ncspPartnerSchema = new mongoose.Schema({
  partnerId: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  partnerName: {
    type: String,
    required: true,
    trim: true,
  },
  ownerName: {
    type: String, // Contact Person
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  logo: {
    type: String,
  },
  address: {
    street: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    pincode: { type: String },
    region: { type: String, required: true }, // e.g. South, West, North, East
  },
  gstin: {
    type: String,
    trim: true,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  onboardedOn: {
    type: Date,
    default: Date.now,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  ratingCount: {
    type: Number,
    default: 120,
  },
  agreementSigned: {
    type: Boolean,
    default: true,
  },
  kycVerified: {
    type: Boolean,
    default: true,
  },
  stats: {
    totalBookings: { type: Number, default: 0 },
    revenueThisMonth: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalPayouts: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
  },
  documents: [{
    name: { type: String },
    fileUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    uploadedAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

ncspPartnerSchema.index({ partnerId: 1 });
ncspPartnerSchema.index({ verificationStatus: 1 });
ncspPartnerSchema.index({ 'address.city': 1 });
ncspPartnerSchema.index({ 'address.region': 1 });

module.exports = mongoose.model('NcspPartner', ncspPartnerSchema);
