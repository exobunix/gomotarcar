const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  payerType: { type: String, enum: ['customer', 'admin', 'franchise'] },
  payerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  payeeType: { type: String, enum: ['gomotarcar', 'cleaner', 'franchise', 'provider'] },
  payeeId: { type: mongoose.Schema.Types.ObjectId },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  gstAmount: { type: Number, default: 0 },
  purpose: {
    type: String,
    enum: ['subscription', 'service_booking', 'fasttag_recharge',
           'cleaner_payout', 'incentive_payout', 'refund', 'wallet_topup'],
  },
  referenceType: { type: String, enum: ['subscription', 'service_booking', 'fasttag', 'earnings'] },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  status: {
    type: String,
    enum: ['created', 'captured', 'refunded', 'failed', 'partial_refunded'],
    default: 'created',
  },
  refundStatus: { type: String, enum: ['none', 'partial', 'full'], default: 'none' },
  refundAmount: { type: Number, default: 0 },
  receipt: String,
  notes: mongoose.Schema.Types.Mixed,
  recurringInfo: {
    isRecurring: Boolean,
    razorpaySubscriptionId: String,
    recurringCycle: Number,
  },
}, { timestamps: true });

paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ payerId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ referenceId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
