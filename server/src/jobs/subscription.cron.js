const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

const startSubscriptionCron = () => {
  // Daily check for expiring subscriptions
  cron.schedule('0 8 * * *', async () => {
    logger.info('[Cron] Checking expiring subscriptions...');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3);
      tomorrow.setHours(0, 0, 0, 0);
      const expiring = await Subscription.find({
        status: 'active',
        endDate: { $lte: tomorrow, $gte: new Date() }
      }).populate('customerId');
      logger.info(`[Cron] Found ${expiring.length} subscriptions expiring soon`);
    } catch (err) {
      logger.error('[Cron] Subscription check failed:', err.message);
    }
  });

  // Auto-expire subscriptions that have ended
  cron.schedule('0 1 * * *', async () => {
    logger.info('[Cron] Auto-expiring ended subscriptions...');
    try {
      const result = await Subscription.updateMany(
        { status: 'active', endDate: { $lt: new Date() } },
        { $set: { status: 'expired' } }
      );
      logger.info(`[Cron] Expired ${result.modifiedCount} subscriptions`);
    } catch (err) {
      logger.error('[Cron] Auto-expire failed:', err.message);
    }
  });

  // Monthly cleaning balance reset on 1st of month at 2 AM
  cron.schedule('0 2 1 * *', async () => {
    logger.info('[Cron] Resetting monthly cleaning balances...');
    try {
      const result = await Subscription.updateMany(
        { status: 'active' },
        [{ $set: { usedCleanings: 0, remainingCleanings: '$totalCleanings' } }]
      );
      logger.info(`[Cron] Reset balances for ${result.modifiedCount} subscriptions`);
    } catch (err) {
      logger.error('[Cron] Balance reset failed:', err.message);
    }
  });
  logger.info('[Cron] Subscription cron registered');
};

module.exports = { startSubscriptionCron };
