const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  // Contact info
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  
  // Lead details
  service: { type: String, trim: true },
  vehicleType: { type: String, trim: true },
  location: { type: String, trim: true },
  source: { type: String, enum: ['search', 'website', 'referral', 'social_media', 'walk_in', 'call', 'other'], default: 'search' },
  
  // Status workflow
  status: { type: String, enum: ['New', 'Contacted', 'Interested', 'Converted', 'Lost'], default: 'New' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  
  // Assignment
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date },
  
  // Notes & activity
  notes: { type: String },
  statusHistory: [{
    status: { type: String, enum: ['New', 'Contacted', 'Interested', 'Converted', 'Lost'] },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remark: { type: String },
  }],
  
  // Conversion tracking
  convertedAt: { type: Date },
  convertedToCustomerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  lostReason: { type: String },
  
  // Metadata
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Communication
  preferredContact: { type: String, enum: ['phone', 'email', 'whatsapp'], default: 'phone' },
  bestTimeToCall: { type: String },
}, { timestamps: true });

// Indexes
leadSchema.index({ phone: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ status: 1, assignedTo: 1 });

module.exports = mongoose.model('Lead', leadSchema);
