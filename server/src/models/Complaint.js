const mongoose = require('mongoose');
const complaintSchema = new mongoose.Schema({
  ticketNumber: { type: String, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  serviceType: { type: String, enum: ['cleaning','service_booking','fasttag','subscription','other'] },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  category: { type: String, enum: ['service_quality','cleaner_behavior','billing','scheduling','other'] },
  description: String, images: [String],
  status: { type: String, enum: ['open','in_progress','resolved','closed'], default: 'open' },
  priority: { type: String, enum: ['low','medium','high','critical'], default: 'medium' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolution: String, resolvedAt: Date, customerRating: Number,
}, { timestamps: true });
complaintSchema.index({ ticketNumber: 1 });
complaintSchema.index({ customerId: 1 });
module.exports = mongoose.model('Complaint', complaintSchema);
