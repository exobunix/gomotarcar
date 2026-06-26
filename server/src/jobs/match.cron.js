const cron = require('node-cron');
const Task = require('../models/Task');
const Cleaner = require('../models/Cleaner');
const Zone = require('../models/Zone');
const logger = require('../utils/logger');

const startMatchCron = () => {
  // Auto-assign cleaners to unassigned tasks every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    logger.info('[Cron] Running auto-assignment for unassigned tasks...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const unassigned = await Task.find({
        $or: [{ cleanerId: { $exists: false } }, { cleanerId: null }],
        scheduledDate: { $gte: today, $lt: tomorrow },
        status: 'assigned'
      }).populate('customerId').populate('vehicleId');

      if (unassigned.length === 0) {
        logger.info('[Cron] No unassigned tasks found');
        return;
      }

      let assigned = 0;
      for (const task of unassigned) {
        // Find nearest available cleaner in same zone
        const availableCleaner = await Cleaner.findOne({
          isActive: true,
          assignedZone: task.zoneId || { $exists: true },
          'stats.currentMonthTasks': { $lt: 60 }
        }).sort({ 'stats.currentMonthTasks': 1 });

        if (availableCleaner) {
          task.cleanerId = availableCleaner._id;
          await task.save();
          assigned++;
        }
      }
      logger.info(`[Cron] Auto-assigned ${assigned}/${unassigned.length} tasks`);
    } catch (err) {
      logger.error('[Cron] Auto-assignment failed:', err.message);
    }
  });
  logger.info('[Cron] Match cron registered (every 30 min)');
};

module.exports = { startMatchCron };
