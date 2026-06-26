/**
 * GoMotarCar Report Service
 * Generates comprehensive business reports for the admin panel
 */
const Customer = require('../models/Customer');
const Cleaner = require('../models/Cleaner');
const Supervisor = require('../models/Supervisor');
const Franchise = require('../models/Franchise');
const NcspPartner = require('../models/NcspPartner');
const Vehicle = require('../models/Vehicle');
const ServiceBooking = require('../models/ServiceBooking');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Complaint = require('../models/Complaint');
const Earnings = require('../models/Earnings');
const mongoose = require('mongoose');

class ReportService {
  /**
   * Build a date filter from query params
   */
  _buildDateFilter(startDate, endDate) {
    if (!startDate && !endDate) return {};
    const filter = {};
    if (startDate) filter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.$lte = end;
    }
    return Object.keys(filter).length ? { createdAt: filter } : {};
  }

  /**
   * Generate a full business summary / KPI snapshot
   */
  async getSummaryReport({ startDate, endDate } = {}) {
    const dateFilter = this._buildDateFilter(startDate, endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalCustomers, newCustomers,
      totalCleaners, activeCleaners, verifiedCleaners, pendingCleaners,
      totalSupervisors,
      totalFranchises, verifiedFranchises, pendingFranchises,
      totalNCSP, activeNCSP,
      totalVehicles,
      activeSubscriptions, expiredSubscriptions, cancelledSubscriptions,
      totalBookings, completedBookings, cancelledBookings,
      bookingsToday,
      totalRevenue, todayRevenue,
    ] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments(dateFilter),
      Cleaner.countDocuments(),
      Cleaner.countDocuments({ isActive: true }),
      Cleaner.countDocuments({ verificationStatus: 'verified' }),
      Cleaner.countDocuments({ verificationStatus: 'pending' }),
      Supervisor.countDocuments(),
      Franchise.countDocuments(),
      Franchise.countDocuments({ verificationStatus: 'verified' }),
      Franchise.countDocuments({ verificationStatus: 'pending' }),
      NcspPartner.countDocuments(),
      NcspPartner.countDocuments({ isActive: true, verificationStatus: 'verified' }),
      Vehicle.countDocuments({ isActive: true }),
      Subscription.countDocuments({ status: 'active' }),
      Subscription.countDocuments({ status: 'expired' }),
      Subscription.countDocuments({ status: 'cancelled' }),
      ServiceBooking.countDocuments(dateFilter),
      ServiceBooking.countDocuments({ ...dateFilter, status: 'completed' }),
      ServiceBooking.countDocuments({ ...dateFilter, status: 'cancelled' }),
      ServiceBooking.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Payment.aggregate([
        { $match: { status: 'captured', ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'captured', createdAt: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    return {
      period: { startDate, endDate },
      customers: { total: totalCustomers, new: newCustomers },
      cleaners: { total: totalCleaners, active: activeCleaners, verified: verifiedCleaners, pending: pendingCleaners },
      supervisors: { total: totalSupervisors },
      franchises: { total: totalFranchises, verified: verifiedFranchises, pending: pendingFranchises },
      ncspPartners: { total: totalNCSP, active: activeNCSP },
      vehicles: { total: totalVehicles },
      subscriptions: { active: activeSubscriptions, expired: expiredSubscriptions, cancelled: cancelledSubscriptions, total: activeSubscriptions + expiredSubscriptions + cancelledSubscriptions },
      bookings: { total: totalBookings, completed: completedBookings, cancelled: cancelledBookings, today: bookingsToday },
      revenue: { total: totalRevenue[0]?.total || 0, today: todayRevenue[0]?.total || 0 },
    };
  }

  /**
   * Revenue report with time-series and breakdown
   */
  async getRevenueReport({ startDate, endDate, groupBy = 'month' } = {}) {
    const dateFilter = this._buildDateFilter(startDate, endDate);
    const dateFormat = groupBy === 'day' ? '%Y-%m-%d' : groupBy === 'year' ? '%Y' : '%Y-%m';

    const [timeSeries, byMethod, byPurpose, totals] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'captured', ...dateFilter } },
        { $group: { _id: { $dateToString: { format: dateFormat, date: '$createdAt' } }, revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Payment.aggregate([
        { $match: { status: 'captured', ...dateFilter } },
        { $group: { _id: '$method', revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'captured', ...dateFilter } },
        { $group: { _id: '$purpose', revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'captured', ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 }, avg: { $avg: '$amount' } } },
      ]),
    ]);

    const totalRefunded = await Payment.aggregate([
      { $match: { status: 'refunded', ...dateFilter } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return {
      summary: {
        total: totals[0]?.total || 0,
        count: totals[0]?.count || 0,
        average: totals[0]?.avg || 0,
        refunded: totalRefunded[0]?.total || 0,
        net: (totals[0]?.total || 0) - (totalRefunded[0]?.total || 0),
      },
      timeSeries: timeSeries.map(d => ({ date: d._id, revenue: d.revenue, count: d.count })),
      byMethod: byMethod.map(d => ({ method: d._id || 'Unknown', revenue: d.revenue, count: d.count })),
      byPurpose: byPurpose.map(d => ({ purpose: d._id || 'Unknown', revenue: d.revenue, count: d.count })),
    };
  }

  /**
   * Booking report with status breakdown and trends
   */
  async getBookingReport({ startDate, endDate, groupBy = 'day' } = {}) {
    const dateFilter = this._buildDateFilter(startDate, endDate);
    const dateFormat = groupBy === 'month' ? '%Y-%m' : groupBy === 'year' ? '%Y' : '%Y-%m-%d';

    const [timeSeries, statusBreakdown, popularServices, totals] = await Promise.all([
      ServiceBooking.aggregate([
        { $match: { ...dateFilter } },
        {
          $group: {
            _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $in: ['$status', ['booked', 'accepted', 'in_progress']] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      ServiceBooking.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      ServiceBooking.aggregate([
        { $match: { ...dateFilter, status: 'completed' } },
        { $group: { _id: '$serviceName', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      ServiceBooking.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: null, total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }, cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } } } },
      ]),
    ]);

    return {
      summary: {
        total: totals[0]?.total || 0,
        completed: totals[0]?.completed || 0,
        cancelled: totals[0]?.cancelled || 0,
        completionRate: totals[0]?.total ? Math.round((totals[0].completed / totals[0].total) * 100) : 0,
      },
      timeSeries: timeSeries.map(d => ({ date: d._id, total: d.total, completed: d.completed, cancelled: d.cancelled, pending: d.pending })),
      statusBreakdown: statusBreakdown.map(d => ({ status: d._id, count: d.count })),
      popularServices: popularServices.map(d => ({ service: d._id, bookings: d.count, revenue: d.revenue })),
    };
  }

  /**
   * Cleaner performance report
   */
  async getCleanerReport({ startDate, endDate, sortBy = 'earnings', limit = 50 } = {}) {
    const dateFilter = this._buildDateFilter(startDate, endDate);

    const [cleaners, totalStats] = await Promise.all([
      Cleaner.aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: 'tasks',
            let: { cleanerId: '$_id' },
            pipeline: [
              { $match: { ...dateFilter, status: 'completed' } },
              { $match: { $expr: { $eq: ['$cleanerId', '$$cleanerId'] } } },
              { $count: 'completed' },
            ],
            as: 'taskCount',
          },
        },
        {
          $lookup: {
            from: 'attendances',
            let: { cleanerId: '$_id' },
            pipeline: [
              { $match: { ...dateFilter } },
              { $match: { $expr: { $eq: ['$cleanerId', '$$cleanerId'] } } },
              { $group: { _id: null, present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }, total: { $sum: 1 } } },
            ],
            as: 'attendanceData',
          },
        },
        {
          $lookup: {
            from: 'zones',
            localField: 'assignedZone',
            foreignField: '_id',
            as: 'zone',
          },
        },
        { $unwind: { path: '$zone', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            completedTasks: { $ifNull: [{ $arrayElemAt: ['$taskCount.completed', 0] }, 0] },
            attendancePercent: {
              $let: {
                vars: { att: { $arrayElemAt: ['$attendanceData', 0] } },
                in: {
                  $cond: [
                    { $gt: ['$$att.total', 0] },
                    { $multiply: [{ $divide: ['$$att.present', '$$att.total'] }, 100] },
                    0,
                  ],
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: { $concat: ['$firstName', ' ', { $ifNull: ['$lastName', ''] }] },
            cleanerId: 1,
            phone: 1,
            photo: 1,
            completedJobs: '$completedTasks',
            totalJobs: '$stats.totalTasksCompleted',
            rating: { $ifNull: ['$stats.averageRating', 0] },
            earnings: { $ifNull: ['$stats.totalEarnings', 0] },
            currentMonthEarnings: { $ifNull: ['$stats.currentMonthEarnings', 0] },
            attendancePercent: { $round: ['$attendancePercent', 0] },
            zone: { $ifNull: ['$zone.name', 'N/A'] },
            employmentType: 1,
            joiningDate: 1,
          },
        },
        { $sort: { [sortBy === 'rating' ? 'rating' : sortBy === 'jobs' ? 'completedJobs' : 'earnings']: -1 } },
        { $limit: limit },
      ]),
      Cleaner.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, totalEarnings: { $sum: '$stats.totalEarnings' }, avgRating: { $avg: '$stats.averageRating' }, totalJobs: { $sum: '$stats.totalTasksCompleted' } } },
      ]),
    ]);

    return {
      summary: {
        totalCleaners: totalStats[0]?.totalJobs || 0,
        totalEarnings: totalStats[0]?.totalEarnings || 0,
        averageRating: totalStats[0]?.avgRating ? Math.round(totalStats[0].avgRating * 10) / 10 : 0,
      },
      cleaners,
    };
  }

  /**
   * Customer growth and subscription report
   */
  async getCustomerReport({ startDate, endDate, groupBy = 'day' } = {}) {
    const dateFilter = this._buildDateFilter(startDate, endDate);
    const dateFormat = groupBy === 'month' ? '%Y-%m' : groupBy === 'year' ? '%Y' : '%Y-%m-%d';

    const [growthData, subscriptionBreakdown, topCustomers] = await Promise.all([
      Customer.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: { $dateToString: { format: dateFormat, date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Customer.aggregate([
        { $group: { _id: '$subscriptionStatus', count: { $sum: 1 } } },
      ]),
      Customer.find({ ...dateFilter })
        .sort({ totalSpent: -1 })
        .limit(10)
        .select('firstName lastName phone totalSpent totalBookings subscriptionStatus')
        .lean(),
    ]);

    return {
      growth: growthData.map(d => ({ date: d._id, newCustomers: d.count })),
      subscriptions: subscriptionBreakdown.map(d => ({ status: d._id || 'none', count: d.count })),
      topCustomers: topCustomers.map(c => ({
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'N/A',
        phone: c.phone,
        totalSpent: c.totalSpent || 0,
        totalBookings: c.totalBookings || 0,
        subscriptionStatus: c.subscriptionStatus || 'none',
      })),
    };
  }

  /**
   * Export report data in a flat format for CSV
   */
  async getExportData({ reportType, startDate, endDate, format = 'json' } = {}) {
    const dateFilter = this._buildDateFilter(startDate, endDate);

    switch (reportType) {
      case 'revenue': {
        const data = await Payment.find({ status: 'captured', ...dateFilter })
          .sort({ createdAt: -1 })
          .select('amount method purpose status createdAt')
          .lean();
        return data.map(d => ({ Date: d.createdAt, Amount: d.amount, Method: d.method || 'N/A', Purpose: d.purpose || 'N/A', Status: d.status }));
      }
      case 'bookings': {
        const data = await ServiceBooking.find(dateFilter)
          .sort({ createdAt: -1 })
          .populate('customerId', 'firstName lastName phone')
          .populate('vehicleId', 'vehicleNumber')
          .lean();
        return data.map(d => ({
          Date: d.createdAt,
          Customer: d.customerId ? `${d.customerId.firstName || ''} ${d.customerId.lastName || ''}`.trim() : 'N/A',
          Phone: d.customerId?.phone || 'N/A',
          Vehicle: d.vehicleId?.vehicleNumber || 'N/A',
          Service: d.serviceName || 'N/A',
          Amount: d.totalAmount || 0,
          Status: d.status,
        }));
      }
      case 'cleaners': {
        const data = await Cleaner.find({ isActive: true })
          .sort({ 'stats.totalEarnings': -1 })
          .select('firstName lastName cleanerId phone stats.totalEarnings stats.totalTasksCompleted stats.averageRating')
          .lean();
        return data.map(d => ({
          Name: `${d.firstName || ''} ${d.lastName || ''}`.trim(),
          ID: d.cleanerId || 'N/A',
          Phone: d.phone || 'N/A',
          'Completed Jobs': d.stats?.totalTasksCompleted || 0,
          'Total Earnings': d.stats?.totalEarnings || 0,
          Rating: d.stats?.averageRating || 0,
        }));
      }
      case 'customers': {
        const data = await Customer.find(dateFilter)
          .sort({ createdAt: -1 })
          .select('firstName lastName phone email totalSpent totalBookings subscriptionStatus createdAt')
          .lean();
        return data.map(d => ({
          Date: d.createdAt,
          Name: `${d.firstName || ''} ${d.lastName || ''}`.trim(),
          Phone: d.phone || 'N/A',
          Email: d.email || 'N/A',
          'Total Spent': d.totalSpent || 0,
          'Total Bookings': d.totalBookings || 0,
          Subscription: d.subscriptionStatus || 'none',
        }));
      }
      case 'subscriptions': {
        const data = await Subscription.find(dateFilter)
          .sort({ createdAt: -1 })
          .populate('customerId', 'firstName lastName phone')
          .lean();
        return data.map(d => ({
          Date: d.createdAt,
          Customer: d.customerId ? `${d.customerId.firstName || ''} ${d.customerId.lastName || ''}`.trim() : 'N/A',
          Phone: d.customerId?.phone || 'N/A',
          Plan: d.packageName || 'N/A',
          Amount: d.netAmount || 0,
          Status: d.status,
          'Start Date': d.startDate,
          'End Date': d.endDate,
        }));
      }
      default:
        return [];
    }
  }
}

module.exports = new ReportService();
