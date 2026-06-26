const mongoose = require('mongoose');
const performanceSchema = new mongoose.Schema({
  cleanerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cleaner', required: true },
  periodType: { type: String, enum: ['weekly','monthly','quarterly'] },
  periodStart: Date, periodEnd: Date,
  tasksAssigned: Number, tasksCompleted: Number, tasksMissed: Number, tasksCancelled: Number, completionRate: Number,
  workingDays: Number, daysPresent: Number, daysAbsent: Number, daysLate: Number, attendanceRate: Number, overtimeHours: Number,
  averageRating: Number, reviewCount: Number, positiveReviews: Number,
  totalEarnings: Number, totalIncentives: Number,
  trainingCompleted: Number, trainingPending: Number, trainingScore: Number,
  performanceScore: Number,
  tier: { type: String, enum: ['elite','pro','regular','needs_improvement'] },
}, { timestamps: true });
performanceSchema.index({ cleanerId: 1, periodStart: -1 });
module.exports = mongoose.model('Performance', performanceSchema);
