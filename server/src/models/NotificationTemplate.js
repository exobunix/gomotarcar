const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  category: { type: String, enum: ['booking', 'payment', 'reminder', 'promotional', 'alert', 'system', 'otp', 'custom'], required: true },
  channels: [{
    type: String,
    enum: ['push', 'sms', 'whatsapp', 'email', 'in_app'],
  }],
  subject: String,
  title: String,
  body: { type: String, required: true },
  smsBody: String,
  whatsappBody: String,
  emailSubject: String,
  emailBody: String,
  variables: [String],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

templateSchema.index({ slug: 1 });
templateSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('NotificationTemplate', templateSchema);
