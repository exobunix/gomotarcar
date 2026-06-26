const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  group: {
    type: String,
    required: true,
    enum: ['general', 'business', 'payment', 'notification', 'sms', 'email', 'razorpay', 'firebase', 'security', 'roles'],
  },
  key: {
    type: String,
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  description: {
    type: String,
  },
  isEncrypted: {
    type: Boolean,
    default: false,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

settingsSchema.index({ group: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Settings', settingsSchema);
