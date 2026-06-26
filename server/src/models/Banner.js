const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  description: String,
  imageUrl: { type: String, required: true },
  mobileImageUrl: String,
  linkUrl: String,
  linkText: String,
  position: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  page: { type: String, default: 'home' },
  startDate: Date,
  endDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

bannerSchema.index({ isActive: 1, page: 1, startDate: 1, endDate: 1 });
bannerSchema.index({ position: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
