const cron = require('node-cron');
const Performance = require('../models/Performance');
const Cleaner = require('../models/Cleaner');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const Review = require('../models/Review');
const TrainingProgress = require('../models/TrainingProgress');
const logger = require('../utils/logger');

const startPerformanceCron = () => {
  // Weekly performance calculation every Sunday at 4 AM
  cron.schedule('0 4 * * 0', async () => {
    logger.info('[Cron] Calculating weekly performance...');
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);

      const cleaners = await Cleaner.find({ isActive: true });
      let calculated = 0;

      for (const cleaner of cleaners) {
        const tasksAssigned = await Task.countDocuments({ cleanerId: cleaner._id, scheduledDate: { $gte: weekStart } });
        const tasksCompleted = await Task.countDocuments({ cleanerId: cleaner._id, status: 'completed', scheduledDate: { $gte: weekStart } });
        const tasksMissed = await Task.countDocuments({ cleanerId: cleaner._id, status: 'missed', scheduledDate: { $gte: weekStart } });
        const completionRate = tasksAssigned > 0 ? (tasksCompleted / tasksAssigned) * 100 : 0;

        const workingDays = await Attendance.countDocuments({ cleanerId: cleaner._id, date: { $gte: weekStart } });
        const daysPresent = await Attendance.countDocuments({ cleanerId: cleaner._id, date: { $gte: weekStart }, status: 'present' });
        const attendanceRate = workingDays > 0 ? (daysPresent / workingDays) * 100 : 0;

        const ratingResult = await Review.aggregate([
          { $match: { reviewedEntityId: cleaner._id, createdAt: { $gte: weekStart } } },
          { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]);
        const averageRating = ratingResult.length > 0 ? ratingResult[0].avg : 0;

        const trainingCompleted = await TrainingProgress.countDocuments({ cleanerId: cleaner._id, completed: true });
        const trainingScore = trainingCompleted > 0 ? 100 : 0;

        const completionScore = completionRate * 0.30;
        const attendanceScore = attendanceRate * 0.20;
        const ratingScore = (averageRating / 5) * 100 * 0.25;
        const trainingScoreWeighted = trainingScore * 0.25;
        const performanceScore = Math.round(completionScore + attendanceScore + ratingScore + trainingScoreWeighted);

        let tier = 'needs_improvement';
        if (performanceScore >= 90) tier = 'elite';
        else if (performanceScore >= 75) tier = 'pro';
        else if (performanceScore >= 60) tier = 'regular';

        await Performance.findOneAndUpdate(
          { cleanerId: cleaner._id, periodType: 'weekly', periodStart: weekStart },
          {
            $set: {
              periodEnd: now, tasksAssigned, tasksCompleted, tasksMissed, tasksCancelled: 0,
              completionRate, workingDays, daysPresent, daysAbsent: workingDays - daysPresent,
              daysLate: 0, attendanceRate, overtimeHours: 0, averageRating,
              reviewCount: ratingResult.length > 0 ? ratingResult[0].count || 0 : 0,
              positiveReviews: 0, totalEarnings: 0, totalIncentives: 0,
              trainingCompleted, trainingPending: 0, trainingScore,
              performanceScore, tier
            }
          },
          { upsert: true }
        );
        calculated++;
      }
      logger.info(`[Cron] Calculated performance for ${calculated} cleaners`);
    } catch (err) {
      logger.error('[Cron] Performance calculation failed:', err.message);
    }
  });
  logger.info('[Cron] Performance cron registered (weekly)');
};

module.exports = { startPerformanceCron };
