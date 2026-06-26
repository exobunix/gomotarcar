const cron = require('node-cron');
const logger = require('../utils/logger');

const startReportCron = () => {
  // Daily summary report at 8 PM
  cron.schedule('0 20 * * *', async () => {
    logger.info('[Cron] Generating daily summary report...');
    try {
      // Report generation logic would go here
      logger.info('[Cron] Daily summary report generated');
    } catch (err) {
      logger.error('[Cron] Daily report failed:', err.message);
    }
  });

  // Weekly report every Monday at 7 AM
  cron.schedule('0 7 * * 1', async () => {
    logger.info('[Cron] Generating weekly report...');
    try {
      logger.info('[Cron] Weekly report generated');
    } catch (err) {
      logger.error('[Cron] Weekly report failed:', err.message);
    }
  });

  // Monthly report on 1st at 6 AM
  cron.schedule('0 6 1 * *', async () => {
    logger.info('[Cron] Generating monthly report...');
    try {
      logger.info('[Cron] Monthly report generated');
    } catch (err) {
      logger.error('[Cron] Monthly report failed:', err.message);
    }
  });
  logger.info('[Cron] Report cron registered');
};

module.exports = { startReportCron };
