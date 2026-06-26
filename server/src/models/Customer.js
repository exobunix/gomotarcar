const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true },
  phone: { type: String, required: true },
  email: { type: String, trim: true, lowercase: true },
  photo: { type: String },
  defaultAddressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
  activeSubscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  subscriptionStatus: {
    type: String,
    enum: ['none', 'active', 'expired', 'cancelled'],
    default: 'none',
  },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  totalBookings: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  totalCleanings: { type: Number, default: 0 },
  cleaningBalance: { type: Number, default: 0 },
}, { timestamps: true });

customerSchema.index({ phone: 1 });
customerSchema.index({ userId: 1 });
customerSchema.index({ referralCode: 1 });

module.exports = mongoose.model('Customer', customerSchema);
