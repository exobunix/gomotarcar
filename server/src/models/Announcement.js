const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'urgent', 'update'], default: 'info' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  targetRoles: [{ type: String, enum: ['customer', 'cleaner', 'supervisor', 'franchise', 'operations', 'admin', 'all'] }],
  imageUrl: String,
  linkUrl: String,
  linkText: String,
  isActive: { type: Boolean, default: true },
  startsAt: Date,
  expiresAt: Date,
  publishedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

announcementSchema.index({ isActive: 1, startsAt: 1, expiresAt: 1 });
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ targetRoles: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
