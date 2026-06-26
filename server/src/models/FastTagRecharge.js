const mongoose = require('mongoose');

const fastTagRechargeSchema = new mongoose.Schema({
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
  
  // Metadata
  receipt: { type: String },
  notes: { type: String },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true, collection: 'fastTagRecharges' });

fastTagRechargeSchema.index({ customerId: 1, createdAt: -1 });
fastTagRechargeSchema.index({ vehicleId: 1, createdAt: -1 });
fastTagRechargeSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('FastTagRecharge', fastTagRechargeSchema);
