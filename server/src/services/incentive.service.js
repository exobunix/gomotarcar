const Incentive = require('../models/Incentive');
const Cleaner = require('../models/Cleaner');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const { AppError } = require('../middleware/errorHandler');

const INCENTIVE_TIERS = {
  platinum: { score: 90, amount: 5000 },
  gold: { score: 80, amount: 3000 },
  silver: { score: 70, amount: 1500 },
  bronze: { score: 60, amount: 500 },
};

class IncentiveService {
  /**
   * Calculate monthly incentive for a cleaner
   */
  async calculateMonthly(cleanerId, month, year) {
    const cleaner = await Cleaner.findById(cleanerId);
    if (!cleaner) throw new AppError('Cleaner not found', 404, 'INC_CLEANER_NOT_FOUND');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get tasks completed in the month
    const tasksCompleted = await Task.countDocuments({
      cleanerId, status: 'completed',
      scheduledDate: { $gte: startDate, $lte: endDate },
    });

    // Get attendance
    const attendanceRecords = await Attendance.find({
      cleanerId, date: { $gte: startDate, $lte: endDate },
    });

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r =>
      ['present', 'late', 'half-day'].includes(r.status)
    ).length;
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Get total earnings
    const totalEarnings = cleaner.stats?.totalEarnings || 0;

    // Get rating
    const averageRating = cleaner.stats?.averageRating || 0;

    // Calculate performance score (weighted)
    const taskScore = Math.min((tasksCompleted / 25) * 100, 100); // Target: 25 tasks/month
    const attendanceScore = Math.min(attendancePercentage, 100);
    const ratingScore = Math.min((averageRating / 5) * 100, 100);
    const earningsScore = Math.min((totalEarnings / 20000) * 100, 100);

    const performanceScore = Math.round(
      taskScore * 0.30 + attendanceScore * 0.30 + ratingScore * 0.20 + earningsScore * 0.20
    );

    // Determine tier
    let tier = 'none';
    let incentiveAmount = 0;
    for (const [tierName, config] of Object.entries(INCENTIVE_TIERS)) {
      if (performanceScore >= config.score) {
        tier = tierName;
        incentiveAmount = config.amount;
        break;
      }
    }

    // Get leaderboard rank
    const allScores = await Incentive.aggregate([
      { $match: { month, year } },
      { $sort: { performanceScore: -1 } },
      { $project: { cleanerId: 1, performanceScore: 1 } },
    ]);
    const leaderboardRank = allScores.findIndex(s =>
      s.cleanerId.toString() === cleanerId.toString()
    ) + 1 || 0;

    // Upsert incentive record
    const incentive = await Incentive.findOneAndUpdate(
      { cleanerId, month, year },
      {
        cleanerId, month, year,
        taskTarget: 25, earningsTarget: 20000, attendanceTarget: 90, ratingTarget: 4.5,
        tasksCompleted, totalEarnings, attendancePercentage: Math.round(attendancePercentage),
        averageRating, performanceScore, tier, incentiveAmount,
        leaderboardRank, zoneRank: leaderboardRank,
      },
      { upsert: true, new: true }
    );

    // Update cleaner stats
    await Cleaner.findByIdAndUpdate(cleanerId, {
      'stats.rank': leaderboardRank || 0,
    });

    return incentive;
  }

  /**
   * Calculate incentives for all cleaners in a month
   */
  async calculateAllMonthly(month, year) {
    const cleaners = await Cleaner.find({ isActive: true });

    const results = await Promise.allSettled(
      cleaners.map(cleaner => this.calculateMonthly(cleaner._id, month, year))
    );

    const fulfilled = results.filter(r => r.status === 'fulfilled').map(r => r.value);

    // Update all ranks
    fulfilled.sort((a, b) => b.performanceScore - a.performanceScore);
    await Promise.allSettled(
      fulfilled.map((incentive, i) =>
        Promise.all([
          Incentive.findByIdAndUpdate(incentive._id, { leaderboardRank: i + 1, zoneRank: i + 1 }),
          Cleaner.findByIdAndUpdate(incentive.cleanerId, { 'stats.rank': i + 1 }),
        ])
      )
    );

    return { totalCalculated: fulfilled.length, totalCleaners: cleaners.length, month, year };
  }

  /**
   * Get incentive by ID
   */
  async getById(incentiveId) {
    const incentive = await Incentive.findById(incentiveId)
      .populate('cleanerId', 'firstName lastName cleanerId');
    if (!incentive) throw new AppError('Incentive not found', 404, 'INC_NOT_FOUND');
    return incentive;
  }

  /**
   * Get cleaner's incentive for a specific month
   */
  async getCleanerMonth(cleanerId, month, year) {
    return Incentive.findOne({ cleanerId, month, year })
      .populate('cleanerId', 'firstName lastName cleanerId');
  }

  /**
   * List incentives
   */
  async list({ page = 1, limit = 20, cleanerId, month, year, tier, isPaid } = {}) {
    const query = {};
    if (cleanerId) query.cleanerId = cleanerId;
    if (month) query.month = month;
    if (year) query.year = year;
    if (tier) query.tier = tier;
    if (isPaid !== undefined) query.incentivePaid = isPaid;

    const skip = (page - 1) * limit;
    const [incentives, total] = await Promise.all([
      Incentive.find(query)
        .populate('cleanerId', 'firstName lastName cleanerId')
        .sort({ performanceScore: -1 }).skip(skip).limit(limit),
      Incentive.countDocuments(query),
    ]);

    return {
      data: incentives,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  /**
   * Mark incentive as paid
   */
  async markAsPaid(incentiveId, payoutId) {
    const incentive = await Incentive.findByIdAndUpdate(
      incentiveId,
      { incentivePaid: true, paidAt: new Date(), payoutId },
      { new: true }
    );
    if (!incentive) throw new AppError('Incentive not found', 404, 'INC_NOT_FOUND');
    return incentive;
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard({ month, year, limit = 20 } = {}) {
    const currentDate = new Date();
    const query = {
      month: month || currentDate.getMonth() + 1,
      year: year || currentDate.getFullYear(),
    };

    return Incentive.find(query)
      .populate('cleanerId', 'firstName lastName cleanerId photo')
      .sort({ performanceScore: -1 })
      .limit(limit);
  }

  /**
   * Get stats
   */
  async getStats() {
    const [total, paid, unpaid] = await Promise.all([
      Incentive.countDocuments(),
      Incentive.countDocuments({ incentivePaid: true }),
      Incentive.countDocuments({ incentivePaid: false }),
    ]);
    const totalAmount = await Incentive.aggregate([
      { $group: { _id: null, total: { $sum: '$incentiveAmount' } } },
    ]);
    return { totalIncentives: total, paid, unpaid, totalAmount: totalAmount[0]?.total || 0 };
  }
}

module.exports = new IncentiveService();
