const mongoose = require('mongoose');

const downloadLinkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  platform: { type: String, enum: ['android', 'ios', 'web', 'other'], required: true },
  url: { type: String, required: true },
  icon: String,
  qrCodeImage: String,
  isActive: { type: Boolean, default: true },
  position: { type: Number, default: 0 },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

downloadLinkSchema.index({ platform: 1, isActive: 1 });
downloadLinkSchema.index({ position: 1 });

module.exports = mongoose.model('DownloadLink', downloadLinkSchema);
