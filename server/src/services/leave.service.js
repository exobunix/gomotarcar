const Leave = require('../models/Leave');
const Cleaner = require('../models/Cleaner');
const { AppError } = require('../middleware/errorHandler');

const LEAVE_LIMITS = { sick: 12, casual: 6, earned: 15, emergency: 3 };

class LeaveService {
  /**
   * Apply for leave
   */
  async apply(data) {
    const { cleanerId, leaveType, fromDate, toDate, reason, attachment, isHalfDay } = data;

    const cleaner = await Cleaner.findById(cleanerId);
    if (!cleaner) throw new AppError('Cleaner not found', 404, 'LEAVE_CLEANER_NOT_FOUND');

    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (to < from) throw new AppError('End date must be after start date', 400, 'LEAVE_INVALID_DATES');

    // Calculate days
    const diffTime = Math.abs(to - from);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check overlapping leaves
    const overlapping = await Leave.findOne({
      cleanerId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { fromDate: { $lte: to }, toDate: { $gte: from } },
      ],
    });
    if (overlapping) {
      throw new AppError('Leave already applied for these dates', 400, 'LEAVE_OVERLAP');
    }

    // Check balance
    const usedLeaves = await Leave.aggregate([
      { $match: { cleanerId: cleaner._id, status: 'approved', leaveType } },
      { $group: { _id: null, total: { $sum: '$totalDays' } } },
    ]);
    const usedDays = usedLeaves[0]?.total || 0;
    const remaining = LEAVE_LIMITS[leaveType] - usedDays;

    if (totalDays > remaining) {
      throw new AppError(
        `Insufficient ${leaveType} leave balance. Used: ${usedDays}, Remaining: ${remaining}`,
        400, 'LEAVE_INSUFFICIENT_BALANCE'
      );
    }

    const leave = await Leave.create({
      cleanerId, leaveType, fromDate: from, toDate: to,
      totalDays: isHalfDay ? 0.5 : totalDays, isHalfDay: isHalfDay || false,
      reason, attachment, status: 'pending',
      balanceSnapshot: { sick: 0, casual: 0, earned: 0, emergency: 0 },
    });

    // Update balance snapshot
    const allLeaves = await Leave.aggregate([
      { $match: { cleanerId: cleaner._id, status: 'approved' } },
      { $group: { _id: '$leaveType', total: { $sum: '$totalDays' } } },
    ]);
    const balance = { sick: 0, casual: 0, earned: 0, emergency: 0 };
    allLeaves.forEach(l => { balance[l._id] = Math.max(0, (LEAVE_LIMITS[l._id] || 12) - l.total); });
    leave.balanceSnapshot = balance;
    await leave.save();

    return leave.populate('cleanerId', 'firstName lastName cleanerId');
  }

  /**
   * Approve leave
   */
  async approve(leaveId, { approvedBy, rejectionReason } = {}) {
    const leave = await Leave.findById(leaveId);
    if (!leave) throw new AppError('Leave not found', 404, 'LEAVE_NOT_FOUND');
    if (leave.status !== 'pending') throw new AppError('Leave is not pending', 400, 'LEAVE_NOT_PENDING');

    leave.status = rejectionReason ? 'rejected' : 'approved';
    leave.approvedBy = approvedBy;
    leave.approvedAt = new Date();
    if (rejectionReason) leave.rejectionReason = rejectionReason;
    await leave.save();

    return leave.populate('cleanerId', 'firstName lastName cleanerId');
  }

  /**
   * Reject leave
   */
  async reject(leaveId, { approvedBy, rejectionReason }) {
    return this.approve(leaveId, { approvedBy, rejectionReason });
  }

  /**
   * Get leave by ID
   */
  async getById(leaveId) {
    const leave = await Leave.findById(leaveId)
      .populate('cleanerId', 'firstName lastName cleanerId')
      .populate('approvedBy', 'phone');
    if (!leave) throw new AppError('Leave not found', 404, 'LEAVE_NOT_FOUND');
    return leave;
  }

  /**
   * List leaves
   */
  async list({ page = 1, limit = 20, cleanerId, status, leaveType, fromDate, toDate } = {}) {
    const query = {};
    if (cleanerId) query.cleanerId = cleanerId;
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (fromDate || toDate) {
      query.fromDate = {};
      if (fromDate) query.fromDate.$gte = new Date(fromDate);
      if (toDate) query.toDate = { $lte: new Date(toDate) };
    }

    const skip = (page - 1) * limit;
    const [leaves, total] = await Promise.all([
      Leave.find(query)
        .populate('cleanerId', 'firstName lastName cleanerId')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Leave.countDocuments(query),
    ]);

    return {
      data: leaves,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  /**
   * Get leave balance for a cleaner
   */
  async getBalance(cleanerId) {
    const usedLeaves = await Leave.aggregate([
      { $match: { cleanerId, status: 'approved' } },
      { $group: { _id: '$leaveType', total: { $sum: '$totalDays' } } },
    ]);

    const balance = { sick: 0, casual: 0, earned: 0, emergency: 0 };
    usedLeaves.forEach(l => {
      balance[l._id] = Math.max(0, (LEAVE_LIMITS[l._id] || 12) - l.total);
    });

    const maxLeaves = { ...LEAVE_LIMITS };

    return { balance, used: usedLeaves.reduce((acc, l) => { acc[l._id] = l.total; return acc; }, {}), limits: maxLeaves };
  }

  /**
   * Get stats
   */
  async getStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      Leave.countDocuments(),
      Leave.countDocuments({ status: 'pending' }),
      Leave.countDocuments({ status: 'approved' }),
      Leave.countDocuments({ status: 'rejected' }),
    ]);
    return { totalLeaves: total, pending, approved, rejected };
  }
}

module.exports = new LeaveService();
