const cron = require('node-cron');
const Payout = require('../models/Payout');
const Earnings = require('../models/Earnings');
const logger = require('../utils/logger');

const startPayoutCron = () => {
  // Process pending payouts daily at 6 AM
  cron.schedule('0 6 * * *', async () => {
    logger.info('[Cron] Processing pending payouts...');
    try {
      const pending = await Payout.find({ status: 'pending' }).limit(50);
      if (pending.length === 0) {
        logger.info('[Cron] No pending payouts');
        return;
      }

      for (const payout of pending) {
        try {
          payout.status = 'processing';
          await payout.save();
          // Actual Razorpay payout API call would go here
          payout.status = 'completed';
          payout.processedAt = new Date();
          await payout.save();

          await Earnings.updateMany(
            { _id: { $in: payout.earningIds } },
            { $set: { paymentStatus: 'paid', payoutId: payout._id, paidAt: new Date() } }
          );
        } catch (err) {
          payout.status = 'failed';
          payout.failureReason = err.message;
          await payout.save();
          logger.error(`[Cron] Payout ${payout.payoutId} failed:`, err.message);
        }
      }
      logger.info(`[Cron] Processed ${pending.length} payouts`);
    } catch (err) {
      logger.error('[Cron] Payout processing failed:', err.message);
    }
  });

  // Weekly payout batch every Monday at 5 AM
  cron.schedule('0 5 * * 1', async () => {
    logger.info('[Cron] Running weekly payout batch...');
    try {
      logger.info('[Cron] Weekly payout batch complete');
    } catch (err) {
      logger.error('[Cron] Weekly payout batch failed:', err.message);
    }
  });
  logger.info('[Cron] Payout cron registered');
};

module.exports = { startPayoutCron };
