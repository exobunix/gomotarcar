const cron = require('node-cron');
const Incentive = require('../models/Incentive');
const Cleaner = require('../models/Cleaner');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const Review = require('../models/Review');
const logger = require('../utils/logger');

const startIncentiveCron = () => {
  // Compute incentives on 1st of each month at 3 AM
  cron.schedule('0 3 1 * *', async () => {
    logger.info('[Cron] Computing monthly incentives...');
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const monthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      const cleaners = await Cleaner.find({ isActive: true });
      let computed = 0;

      for (const cleaner of cleaners) {
        const tasksCompleted = await Task.countDocuments({
          cleanerId: cleaner._id,
          status: 'completed',
          scheduledDate: { $gte: monthStart, $lte: monthEnd }
        });

        const avgRating = await Review.aggregate([
          { $match: { reviewedEntityId: cleaner._id, createdAt: { $gte: monthStart, $lte: monthEnd } } },
          { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]);

        const attendanceDays = await Attendance.countDocuments({
          cleanerId: cleaner._id,
          date: { $gte: monthStart, $lte: monthEnd },
          status: 'present'
        });

        const totalWorkDays = await Attendance.countDocuments({
          cleanerId: cleaner._id,
          date: { $gte: monthStart, $lte: monthEnd }
        });

        const attendancePct = totalWorkDays > 0 ? (attendanceDays / totalWorkDays) * 100 : 0;
        const rating = avgRating.length > 0 ? avgRating[0].avg : 0;

        let tier = 'none';
        let incentiveAmount = 0;

        if (tasksCompleted >= 60 && rating >= 4.5 && attendancePct >= 95) {
          tier = 'platinum'; incentiveAmount = 5000;
        } else if (tasksCompleted >= 50 && rating >= 4.0 && attendancePct >= 90) {
          tier = 'gold'; incentiveAmount = 3000;
        } else if (tasksCompleted >= 40 && rating >= 3.5 && attendancePct >= 85) {
          tier = 'silver'; incentiveAmount = 1500;
        } else if (tasksCompleted >= 30 && rating >= 3.0 && attendancePct >= 80) {
          tier = 'bronze'; incentiveAmount = 500;
        }

        await Incentive.findOneAndUpdate(
          { cleanerId: cleaner._id, month: lastMonth.getMonth() + 1, year: lastMonth.getFullYear() },
          {
            $set: {
              tasksCompleted, totalEarnings: 0, attendancePercentage: attendancePct,
              averageRating: rating, performanceScore: 0, tier, incentiveAmount,
              incentivePaid: false
            }
          },
          { upsert: true }
        );
        computed++;
      }
      logger.info(`[Cron] Computed incentives for ${computed} cleaners`);
    } catch (err) {
      logger.error('[Cron] Incentive computation failed:', err.message);
    }
  });
  logger.info('[Cron] Incentive cron registered (1st of month)');
};

module.exports = { startIncentiveCron };
