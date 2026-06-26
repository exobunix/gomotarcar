const { startAttendanceCron } = require('./attendance.cron');
const { startEarningsCron } = require('./earnings.cron');
const { startSubscriptionCron } = require('./subscription.cron');
const { startIncentiveCron } = require('./incentive.cron');
const { startPayoutCron } = require('./payout.cron');
const { startNotificationCron } = require('./notification.cron');
const { startPerformanceCron } = require('./performance.cron');
const { startCleanupCron } = require('./cleanup.cron');
const { startMatchCron } = require('./match.cron');
const { startReportCron } = require('./report.cron');

const initializeCronJobs = () => {
  startAttendanceCron();
  startEarningsCron();
  startSubscriptionCron();
  startIncentiveCron();
  startPayoutCron();
  startNotificationCron();
  startPerformanceCron();
  startCleanupCron();
  startMatchCron();
  startReportCron();
};

module.exports = { initializeCronJobs };
