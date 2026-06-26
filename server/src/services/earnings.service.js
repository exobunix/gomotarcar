const Earnings = require('../models/Earnings');
const Cleaner = require('../models/Cleaner');
const Task = require('../models/Task');
const { AppError } = require('../middleware/errorHandler');

class EarningsService {
  /**
   * Calculate and record earnings for a completed task
   */
  async recordTaskEarnings(taskId) {
    const task = await Task.findById(taskId).populate('cleanerId');
    if (!task) throw new AppError('Task not found', 404, 'EARN_TASK_NOT_FOUND');
    if (!task.cleanerId) throw new AppError('Task has no cleaner assigned', 400, 'EARN_NO_CLEANER');
    if (task.status !== 'completed') throw new AppError('Task is not completed', 400, 'EARN_TASK_NOT_COMPLETED');

    // Calculate earnings based on package type
    const rates = { basic: 50, premium: 75, elite: 100 };
    const baseAmount = rates[task.packageType] || 50;

    const earnings = await Earnings.create({
      cleanerId: task.cleanerId._id || task.cleanerId,
      taskId: task._id,
      baseAmount,
      netAmount: baseAmount,
      breakdown: { perTaskRate: baseAmount, taskCount: 1, incentiveRate: 0, overtimeRate: 0 },
      periodType: 'daily',
      periodStart: task.scheduledDate,
      periodEnd: task.scheduledDate,
    });

    // Update cleaner stats
    const cleanerId = task.cleanerId._id || task.cleanerId;
    await Cleaner.findByIdAndUpdate(cleanerId, {
      $inc: { 'stats.totalEarnings': baseAmount, 'stats.currentMonthEarnings': baseAmount },
    });

    // Update task with earnings
    task.cleanerEarnings = baseAmount;
    await task.save();

    return earnings;
  }

  /**
   * Calculate period earnings for a cleaner
   */
  async calculatePeriodEarnings(cleanerId, { periodType, periodStart, periodEnd }) {
    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    end.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      cleanerId,
      status: 'completed',
      scheduledDate: { $gte: start, $lte: end },
    });

    let totalBaseAmount = 0;
    let totalIncentiveAmount = 0;
    const rates = { basic: 50, premium: 75, elite: 100 };

    tasks.forEach(task => {
      totalBaseAmount += rates[task.packageType] || 50;
      totalIncentiveAmount += task.incentiveEarned || 0;
    });

    const netAmount = totalBaseAmount + totalIncentiveAmount;

    const earnings = await Earnings.create({
      cleanerId,
      periodType,
      periodStart: start,
      periodEnd: end,
      baseAmount: totalBaseAmount,
      incentiveAmount: totalIncentiveAmount,
      netAmount,
      breakdown: {
        perTaskRate: totalBaseAmount / (tasks.length || 1),
        taskCount: tasks.length,
        incentiveRate: totalIncentiveAmount / (tasks.length || 1),
        overtimeRate: 0,
      },
    });

    return earnings;
  }

  /**
   * Get earnings by ID
   */
  async getById(earningsId) {
    const earnings = await Earnings.findById(earningsId)
      .populate('cleanerId', 'firstName lastName cleanerId')
      .populate('taskId', 'taskId scheduledDate packageType')
      .populate('payoutId', 'payoutId status');
    if (!earnings) throw new AppError('Earnings not found', 404, 'EARN_NOT_FOUND');
    return earnings;
  }

  /**
   * List earnings
   */
  async list({ page = 1, limit = 20, cleanerId, paymentStatus, periodType, fromDate, toDate } = {}) {
    const query = {};
    if (cleanerId) query.cleanerId = cleanerId;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (periodType) query.periodType = periodType;
    if (fromDate || toDate) {
      query.periodStart = {};
      if (fromDate) query.periodStart.$gte = new Date(fromDate);
      if (toDate) {
        query.periodEnd = {};
        query.periodEnd.$lte = new Date(toDate);
      }
    }

    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      Earnings.find(query)
        .populate('cleanerId', 'firstName lastName cleanerId')
        .populate('taskId', 'taskId scheduledDate')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Earnings.countDocuments(query),
    ]);

    return {
      data: records,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  /**
   * Get cleaner's total earnings summary
   */
  async getCleanerSummary(cleanerId) {
    const [totalEarnings, pendingEarnings, paidEarnings, monthlyEarnings] = await Promise.all([
      Earnings.aggregate([
        { $match: { cleanerId } },
        { $group: { _id: null, total: { $sum: '$netAmount' }, count: { $sum: 1 } } },
      ]),
      Earnings.countDocuments({ cleanerId, paymentStatus: { $in: ['pending', 'processed'] } }),
      Earnings.countDocuments({ cleanerId, paymentStatus: 'paid' }),
      Earnings.aggregate([
        { $match: { cleanerId, periodType: 'monthly' } },
        { $sort: { createdAt: -1 } },
        { $limit: 1 },
      ]),
    ]);

    return {
      totalEarnings: totalEarnings[0]?.total || 0,
      totalTasks: totalEarnings[0]?.count || 0,
      pendingEarnings,
      paidEarnings,
      latestMonthly: monthlyEarnings[0] || null,
    };
  }

  /**
   * Mark earnings as paid
   */
  async markAsPaid(earningsId, payoutId) {
    const earnings = await Earnings.findByIdAndUpdate(
      earningsId,
      { paymentStatus: 'paid', payoutId, paidAt: new Date() },
      { new: true }
    );
    if (!earnings) throw new AppError('Earnings not found', 404, 'EARN_NOT_FOUND');
    return earnings;
  }

  /**
   * Get stats
   */
  async getStats() {
    const [total, pending, paid] = await Promise.all([
      Earnings.countDocuments(),
      Earnings.countDocuments({ paymentStatus: { $in: ['pending', 'processed'] } }),
      Earnings.countDocuments({ paymentStatus: 'paid' }),
    ]);
    const totalAmount = await Earnings.aggregate([
      { $match: {} },
      { $group: { _id: null, total: { $sum: '$netAmount' } } },
    ]);
    return { totalEarnings: total, pending, paid, totalAmount: totalAmount[0]?.total || 0 };
  }
}

module.exports = new EarningsService();
