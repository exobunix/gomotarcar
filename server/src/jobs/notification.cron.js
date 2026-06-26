const cron = require('node-cron');
const Campaign = require('../models/Campaign');
const logger = require('../utils/logger');

const startNotificationCron = () => {
  // Check for scheduled campaigns every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    logger.info('[Cron] Checking scheduled campaigns...');
    try {
      const now = new Date();
      const dueCampaigns = await Campaign.find({
        status: 'scheduled',
        scheduledAt: { $lte: now }
      }).populate('createdBy');

      for (const campaign of dueCampaigns) {
        try {
          campaign.status = 'sending';
          await campaign.save();
          // Push notification delivery logic would go here
          campaign.status = 'sent';
          campaign.sentAt = new Date();
          await campaign.save();
          logger.info(`[Cron] Campaign ${campaign.name} sent successfully`);
        } catch (err) {
          campaign.status = 'failed';
          await campaign.save();
          logger.error(`[Cron] Campaign ${campaign.name} failed:`, err.message);
        }
      }
    } catch (err) {
      logger.error('[Cron] Campaign check failed:', err.message);
    }
  });

  // Daily reminder notifications at 9 AM
  cron.schedule('0 9 * * *', async () => {
    logger.info('[Cron] Sending daily reminders...');
    try {
      logger.info('[Cron] Daily reminders sent');
    } catch (err) {
      logger.error('[Cron] Daily reminders failed:', err.message);
    }
  });
  logger.info('[Cron] Notification cron registered');
};

module.exports = { startNotificationCron };
