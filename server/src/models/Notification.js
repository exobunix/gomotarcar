const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientRole: String,
  type: { type: String, enum: ['task_assignment','task_reminder','attendance_alert','issue_update','payment_update','leave_status','incentive','booking_update','subscription_reminder','complaint_update','announcement','training','system'] },
  title: String, body: String, data: mongoose.Schema.Types.Mixed,
  priority: { type: String, enum: ['low','normal','high','urgent'], default: 'normal' },
  isRead: { type: Boolean, default: false }, readAt: Date,
  pushSent: { type: Boolean, default: false }, pushSentAt: Date, pushDelivered: { type: Boolean, default: false },
  imageUrl: String,
}, { timestamps: true });
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });
// TTL: 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
module.exports = mongoose.model('Notification', notificationSchema);
