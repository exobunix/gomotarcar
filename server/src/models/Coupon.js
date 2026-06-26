const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: String,
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  maxDiscount: Number,
  minOrderAmount: { type: Number, default: 0 },
  applicableTo: [{ type: String, enum: ['subscription', 'service', 'fasttag', 'all'] }],
  userLimit: { type: Number, default: 1 },
  totalUses: { type: Number, default: 0 },
  maxUses: Number,
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usersUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
