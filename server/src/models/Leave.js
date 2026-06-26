const mongoose = require('mongoose');
const leaveSchema = new mongoose.Schema({
  cleanerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cleaner', required: true },
  leaveType: { type: String, enum: ['sick', 'casual', 'earned', 'emergency', 'other'], required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  isHalfDay: { type: Boolean, default: false },
  reason: { type: String },
  attachment: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectionReason: String,
  balanceSnapshot: { sick: Number, casual: Number, earned: Number, emergency: Number },
}, { timestamps: true });
leaveSchema.index({ cleanerId: 1, status: 1 });
leaveSchema.index({ fromDate: 1, toDate: 1 });
module.exports = mongoose.model('Leave', leaveSchema);
