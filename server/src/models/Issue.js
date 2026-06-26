const mongoose = require('mongoose');
const issueSchema = new mongoose.Schema({
  ticketNumber: { type: String, unique: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Cleaner', required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  category: { type: String, enum: ['vehicle_locked','vehicle_missing','customer_complaint','qr_damaged','payment_issue','other'] },
  description: String, photos: [String],
  status: { type: String, enum: ['open','in_progress','resolved','closed'], default: 'open' },
  priority: { type: String, enum: ['low','medium','high','critical'], default: 'medium' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: Date,
  timeline: [{ status: String, note: String, updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, updatedAt: { type: Date, default: Date.now } }],
  resolution: String, resolvedAt: Date, resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
issueSchema.index({ ticketNumber: 1 });
issueSchema.index({ reportedBy: 1 });
issueSchema.index({ status: 1 });
module.exports = mongoose.model('Issue', issueSchema);
