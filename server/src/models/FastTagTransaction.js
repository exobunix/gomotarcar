const mongoose = require('mongoose');

const fastTagTransactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true, required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  
  // Recharge details
  amount: { type: Number, required: true, min: 0 },
  openingBalance: { type: Number, default: 0 },
  closingBalance: { type: Number, default: 0 },
  
  // Payment
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  paymentMethod: { type: String, enum: ['razorpay', 'wallet', 'cash', 'upi'], default: 'razorpay' },
  
  // Status
  status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  type: { type: String, enum: ['recharge', 'toll_deduction', 'refund'], default: 'recharge' },
  
  // Toll transaction link (for deductions)
  tollTransactionId: { type: String },
  tollPlaza: { type: String },
  tollDate: { type: Date },
  
  // Metadata
  receipt: { type: String },
  notes: { type: String },
  
  // Audit
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  successAt: { type: Date },
  failedAt: { type: Date },
  failureReason: { type: String },
}, { timestamps: true });

// Indexes
fastTagTransactionSchema.index({ vehicleId: 1, createdAt: -1 });
fastTagTransactionSchema.index({ customerId: 1, createdAt: -1 });
fastTagTransactionSchema.index({ transactionId: 1 });
fastTagTransactionSchema.index({ status: 1 });

module.exports = mongoose.model('FastTagTransaction', fastTagTransactionSchema);
