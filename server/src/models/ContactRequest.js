const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  subject: String,
  message: { type: String, required: true },
  page: String,
  status: { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

contactRequestSchema.index({ status: 1 });
contactRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ContactRequest', contactRequestSchema);
