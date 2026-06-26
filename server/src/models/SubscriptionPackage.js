const mongoose = require('mongoose');
const packageSchema = new mongoose.Schema({
  name: String, code: { type: String, unique: true },
  price: Number, discountPrice: Number, gstPercent: { type: Number, default: 18 }, setupFee: { type: Number, default: 0 },
  frequencyOptions: [String], cleaningsPerMonth: Number, durationMonths: Number,
  services: [{ serviceId: String, name: String, included: Boolean }],
  features: [String], isPopular: { type: Boolean, default: false }, sortOrder: Number,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('SubscriptionPackage', packageSchema);
