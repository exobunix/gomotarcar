const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  type: { type: String, enum: ['privacy', 'terms', 'refund', 'shipping', 'cookies', 'other'], required: true },
  content: { type: String, required: true },
  summary: String,
  version: { type: String, default: '1.0' },
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  lastReviewedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

policySchema.index({ slug: 1 });
policySchema.index({ type: 1, isPublished: 1 });

module.exports = mongoose.model('Policy', policySchema);
