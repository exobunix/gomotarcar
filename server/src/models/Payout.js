const mongoose = require('mongoose');
const payoutSchema = new mongoose.Schema({
  payoutId: { type: String, unique: true },
  cleanerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cleaner' },
  type: { type: String, enum: ['single','bulk'] },
  periodType: { type: String, enum: ['daily','weekly','monthly','incentive'] },
  periodStart: Date, periodEnd: Date,
  totalAmount: Number, feeAmount: Number, netAmount: Number,
  earningIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Earnings' }],
  taskCount: Number,
  status: { type: String, enum: ['pending','processing','completed','failed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['razorpay_payout','bank_transfer','upi'] },
  razorpayPayoutId: String, transactionRef: String, processedAt: Date,
  recipientName: String, recipientAccount: String, recipientIfsc: String, recipientUpi: String,
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  failureReason: String,
}, { timestamps: true });
payoutSchema.index({ cleanerId: 1 });
payoutSchema.index({ status: 1 });
module.exports = mongoose.model('Payout', payoutSchema);
