const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['coupon', 'offer', 'seasonal', 'referral'], required: true },
  code: { type: String, unique: true, sparse: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  maxDiscount: Number,
  minOrderAmount: { type: Number, default: 0 },
  applicableTo: [{ type: String, enum: ['subscription', 'service', 'fasttag', 'all'] }],
  userLimit: { type: Number, default: 1 },
  totalLimit: Number,
  usedCount: { type: Number, default: 0 },
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  terms: String,
  image: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

offerSchema.index({ code: 1 });
offerSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });
offerSchema.index({ type: 1 });

module.exports = mongoose.model('Offer', offerSchema);
