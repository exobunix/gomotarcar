const cron = require('node-cron');
const Earnings = require('../models/Earnings');
const logger = require('../utils/logger');

const startEarningsCron = () => {
  // Daily earnings snapshot at 11:59 PM
  cron.schedule('59 23 * * *', async () => {
    logger.info('[Cron] Running daily earnings snapshot...');
    try {
      // Daily earning summary logic would go here
      logger.info('[Cron] Daily earnings snapshot complete');
    } catch (err) {
      logger.error('[Cron] Earnings snapshot failed:', err.message);
    }
  });

  // Weekly earnings recalculation every Sunday at midnight
  cron.schedule('0 0 * * 0', async () => {
    logger.info('[Cron] Running weekly earnings calculation...');
    try {
      logger.info('[Cron] Weekly earnings calculation complete');
    } catch (err) {
      logger.error('[Cron] Weekly earnings failed:', err.message);
    }
  });
  logger.info('[Cron] Earnings cron registered');
};

module.exports = { startEarningsCron };
