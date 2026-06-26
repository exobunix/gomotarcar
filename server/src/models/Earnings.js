const mongoose = require('mongoose');
const earningsSchema = new mongoose.Schema({
  cleanerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cleaner', required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  baseAmount: { type: Number, default: 0 },
  incentiveAmount: { type: Number, default: 0 },
  overtimeAmount: { type: Number, default: 0 },
  bonusAmount: { type: Number, default: 0 },
  deductionAmount: { type: Number, default: 0 },
  netAmount: { type: Number, default: 0 },
  breakdown: { perTaskRate: Number, taskCount: Number, incentiveRate: Number, overtimeRate: Number },
  periodType: { type: String, enum: ['daily', 'weekly', 'monthly'] },
  periodStart: Date,
  periodEnd: Date,
  paymentStatus: { type: String, enum: ['pending', 'processed', 'paid', 'failed'], default: 'pending' },
  payoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payout' },
  paidAt: Date,
}, { timestamps: true });
earningsSchema.index({ cleanerId: 1, periodStart: -1 });
earningsSchema.index({ paymentStatus: 1 });
module.exports = mongoose.model('Earnings', earningsSchema);
