const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  subscriptionId: { type: String, unique: true, sparse: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  apartmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment' },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPackage' },
  packageType: { type: String, enum: ['basic', 'premium', 'elite', 'platinum', 'free'] },
  packageName: String,
  frequency: { type: String, enum: ['weekly', 'biweekly', 'monthly'] },
  totalAmount: Number,
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['percentage', 'fixed'] },
  gstAmount: Number,
  netAmount: Number,
  paymentAmount: Number,
  paymentMode: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  trialEndDate: Date,
  durationMonths: Number,
  totalCleanings: Number,
  usedCleanings: { type: Number, default: 0 },
  remainingCleanings: Number,
  remainingServices: Number,
  extraCleanings: { type: Number, default: 0 },
  extraCleaningRate: Number,
  status: {
    type: String,
    enum: ['active', 'expired', 'pending', 'cancelled', 'paused'],
    default: 'active',
  },
  autoRenew: { type: Boolean, default: false },
  cleanerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cleaner' },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledAt: Date,
  cancellationReason: String,
  cancelledBy: { type: String, enum: ['customer', 'admin'] },
  refundEligible: { type: Boolean, default: false },
  refundAmount: Number,
  refundProcessed: { type: Boolean, default: false },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  razorpaySubscriptionId: String,
}, { timestamps: true });

subscriptionSchema.index({ subscriptionId: 1 });
subscriptionSchema.index({ customerId: 1 });
subscriptionSchema.index({ cleanerId: 1 });
subscriptionSchema.index({ supervisorId: 1 });
subscriptionSchema.index({ apartmentId: 1 });
subscriptionSchema.index({ status: 1, endDate: -1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
