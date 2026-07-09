const mongoose = require('mongoose');

const supervisorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  photo: {
    type: String,
  },
  assignedZone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
  },
  cleanerCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  experience: {
    type: Number,
    default: 0,
  },
  allocatedApartments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Apartment',
  }],
  allocatedCleaners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cleaner',
  }],
  qrCodesIssued: {
    type: Number,
    default: 250,
  },
  qrCodesAvailable: {
    type: Number,
    default: 32,
  },
  workApprovalsCount: {
    type: Number,
    default: 1256,
  },
  workRejectionsCount: {
    type: Number,
    default: 24,
  },
  inventory: [{
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String },
    quantity: { type: Number, default: 0 },
    allocated: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    unit: { type: String, default: 'pcs' },
    minStock: { type: Number, default: 10 }
  }],
}, {
  timestamps: true,
});

supervisorSchema.index({ userId: 1 });
supervisorSchema.index({ assignedZone: 1 });

module.exports = mongoose.model('Supervisor', supervisorSchema);
