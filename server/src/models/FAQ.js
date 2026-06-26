const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: 'general' },
  position: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

faqSchema.index({ category: 1, isActive: 1, position: 1 });
faqSchema.index({ position: 1 });
faqSchema.index({ isActive: 1 });

module.exports = mongoose.model('FAQ', faqSchema);
