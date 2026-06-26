const mongoose = require('mongoose');
const incentiveSchema = new mongoose.Schema({
  cleanerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cleaner', required: true },
  month: Number, year: Number,
  taskTarget: Number, earningsTarget: Number, attendanceTarget: Number, ratingTarget: Number,
  tasksCompleted: Number, totalEarnings: Number, attendancePercentage: Number, averageRating: Number,
  performanceScore: Number,
  tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'none'] },
  incentiveAmount: { type: Number, default: 0 },
  incentivePaid: { type: Boolean, default: false },
  leaderboardRank: Number, zoneRank: Number,
  paidAt: Date, payoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payout' },
}, { timestamps: true });
incentiveSchema.index({ cleanerId: 1, month: 1, year: 1 });
module.exports = mongoose.model('Incentive', incentiveSchema);
