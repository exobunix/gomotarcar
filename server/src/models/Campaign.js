const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'NotificationTemplate' },
  channels: [{ type: String, enum: ['push', 'sms', 'whatsapp', 'email', 'in_app'] }],
  targetRoles: [{ type: String, enum: ['customer', 'cleaner', 'supervisor', 'franchise', 'operations', 'admin'] }],
  targetUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  schedulingType: { type: String, enum: ['immediate', 'scheduled', 'recurring'], default: 'immediate' },
  scheduledAt: Date,
  recurringConfig: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    interval: Number,
    endDate: Date,
    dayOfWeek: Number,
    dayOfMonth: Number,
    time: String,
  },
  status: { type: String, enum: ['draft', 'scheduled', 'sending', 'sent', 'cancelled', 'failed'], default: 'draft' },
  stats: {
    totalTargeted: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
  },
  messageData: {
    title: String,
    body: String,
    data: mongoose.Schema.Types.Mixed,
  },
  sentAt: Date,
  completedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

campaignSchema.index({ status: 1, scheduledAt: 1 });
campaignSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Campaign', campaignSchema);
