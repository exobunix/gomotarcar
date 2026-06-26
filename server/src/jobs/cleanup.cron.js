const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const startCleanupCron = () => {
  // Daily cleanup at 2:30 AM
  cron.schedule('30 2 * * *', async () => {
    logger.info('[Cron] Running cleanup tasks...');
    try {
      // Clean up temp uploads older than 24 hours
      const uploadsDir = path.resolve(__dirname, '../../uploads');
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        let cleaned = 0;
        const now = Date.now();
        for (const file of files) {
          const filePath = path.join(uploadsDir, file);
          try {
            const stat = fs.statSync(filePath);
            if (stat.isFile() && now - stat.mtimeMs > 86400000) {
              fs.unlinkSync(filePath);
              cleaned++;
            }
          } catch (err) {
            // Skip files that can't be accessed
          }
        }
        if (cleaned > 0) logger.info(`[Cron] Cleaned ${cleaned} old upload files`);
      }

      // Clean old logs (keep 14 days)
      const logDir = path.resolve(__dirname, '../../logs');
      if (fs.existsSync(logDir)) {
        const logFiles = fs.readdirSync(logDir);
        let cleaned = 0;
        const fourteenDaysAgo = Date.now() - 14 * 86400000;
        for (const file of logFiles) {
          const filePath = path.join(logDir, file);
          try {
            const stat = fs.statSync(filePath);
            if (stat.isFile() && stat.mtimeMs < fourteenDaysAgo) {
              fs.unlinkSync(filePath);
              cleaned++;
            }
          } catch (err) { /* skip */ }
        }
        if (cleaned > 0) logger.info(`[Cron] Cleaned ${cleaned} old log files`);
      }

      logger.info('[Cron] Cleanup complete');
    } catch (err) {
      logger.error('[Cron] Cleanup failed:', err.message);
    }
  });
  logger.info('[Cron] Cleanup cron registered (daily 2:30 AM)');
};

module.exports = { startCleanupCron };
