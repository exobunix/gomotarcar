const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const logger = require('../utils/logger');

// Auto-mark no-shows at 10:30 AM every weekday
const startAttendanceCron = () => {
  cron.schedule('30 10 * * 1-5', async () => {
    logger.info('[Cron] Running attendance no-show auto-mark...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const result = await Attendance.updateMany(
        { date: today, status: 'pending', 'checkIn.time': null },
        { $set: { status: 'absent' } }
      );
      logger.info(`[Cron] Marked ${result.modifiedCount} cleaners as absent`);
    } catch (err) {
      logger.error('[Cron] Attendance auto-mark failed:', err.message);
    }
  });
  logger.info('[Cron] Attendance cron registered (10:30 AM Mon-Fri)');
};

module.exports = { startAttendanceCron };
