const mongoose = require('mongoose');
const chatMessageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messageType: { type: String, enum: ['text','image','file','issue_escalation'], default: 'text' },
  content: { type: String },
  mediaUrl: String,
  isRead: { type: Boolean, default: false }, readAt: Date,
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
}, { timestamps: true });
chatMessageSchema.index({ conversationId: 1, createdAt: 1 });
module.exports = mongoose.model('ChatMessage', chatMessageSchema);
