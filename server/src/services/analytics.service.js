const Customer = require('../models/Customer');
const ServiceBooking = require('../models/ServiceBooking');
const Payment = require('../models/Payment');
const FastTagRecharge = require('../models/FastTagRecharge');
const Cleaner = require('../models/Cleaner');
const Supervisor = require('../models/Supervisor');
const Franchise = require('../models/Franchise');
const Subscription = require('../models/Subscription');
const Lead = require('../models/Lead');

class AnalyticsService {
  async getDashboardMetrics({ startDate, endDate, period = 'month' }) {
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [
      totalCustomers, newCustomers,
      activeSubscriptions, newSubscriptions,
      totalBookings, bookingsByStatus,
      totalRevenue, revenueByPeriod,
      totalPayments, paymentsByMethod,
      totalFastTag, fastTagRevenue,
      totalCleaners, activeCleaners,
      totalSupervisors,
      totalLeads, leadsByStatus,
      franchiseStats,
    ] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments(dateFilter),
      Subscription.countDocuments({ status: 'active' }),
      Subscription.countDocuments(dateFilter),
      ServiceBooking.countDocuments(),
      ServiceBooking.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { ...dateFilter, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { ...dateFilter, status: 'completed' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Payment.countDocuments({ ...dateFilter }),
      Payment.aggregate([
        { $match: { ...dateFilter, status: 'completed' } },
        { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      FastTagRecharge.countDocuments(dateFilter),
      FastTagRecharge.aggregate([
        { $match: { ...dateFilter, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Cleaner.countDocuments(),
      Cleaner.countDocuments({ isActive: true }),
      Supervisor.countDocuments(),
      Lead.countDocuments(),
      Lead.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Franchise.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: '$stats.totalRevenue' }, totalBookings: { $sum: '$stats.totalBookings' }, avgRating: { $avg: '$stats.rating' } } },
      ]),
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const fastTagTotal = fastTagRevenue[0]?.total || 0;
    const franchiseData = franchiseStats[0] || { totalRevenue: 0, totalBookings: 0, avgRating: 0 };

    const bookingStatusMap = {};
    bookingsByStatus.forEach((b) => { bookingStatusMap[b._id] = b.count; });
    const leadStatusMap = {};
    leadsByStatus.forEach((l) => { leadStatusMap[l._id] = l.count; });

    return {
      customers: { total: totalCustomers, new: newCustomers },
      subscriptions: { active: activeSubscriptions, new: newSubscriptions },
      bookings: { total: totalBookings, byStatus: bookingStatusMap },
      revenue: { total: revenue, totalRevenue: revenue },
      payments: { total: totalPayments, byMethod: paymentsByMethod, revenueByPeriod },
      fastTag: { total: totalFastTag, revenue: fastTagTotal },
      cleaners: { total: totalCleaners, active: activeCleaners, productivity: activeCleaners > 0 ? Math.round(totalBookings / activeCleaners) : 0 },
      supervisors: { total: totalSupervisors },
      leads: { total: totalLeads, byStatus: leadStatusMap },
      franchise: franchiseData,
    };
  }

  async getRevenueReport({ startDate, endDate, groupBy = 'month' }) {
    const match = { status: 'completed' };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const dateFormat = groupBy === 'day' ? '%Y-%m-%d' : groupBy === 'year' ? '%Y' : '%Y-%m';
    const data = await Payment.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: dateFormat, date: '$createdAt' } }, revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    return { data, total: data.reduce((s, d) => s + d.revenue, 0), groupBy };
  }

  async getCleanerProductivity({ startDate, endDate, limit = 50 }) {
    const match = {};
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    // Single aggregation pipeline: starts from Cleaner, left-joins booking counts
    // Handles edge case: cleaners with 0 completed bookings still appear
    return Cleaner.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'servicebookings',
          let: { cleanerId: '$_id' },
          pipeline: [
            { $match: { ...match, status: 'completed' } },
            { $match: { $expr: { $eq: ['$cleanerId', '$$cleanerId'] } } },
            { $count: 'completed' },
          ],
          as: 'bookingCount',
        },
      },
      {
        $addFields: {
          completedBookings: { $ifNull: [{ $arrayElemAt: ['$bookingCount.completed', 0] }, 0] },
        },
      },
      { $sort: { completedBookings: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: { $concat: ['$firstName', ' ', { $ifNull: ['$lastName', ''] }] },
          phone: 1,
          completedBookings: 1,
          rating: { $ifNull: ['$stats.averageRating', 0] },
        },
      },
    ]);
  }

  async getExportData({ type, startDate, endDate }) {
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    switch (type) {
      case 'bookings':
        return ServiceBooking.find(dateFilter).populate('customerId', 'name phone').populate('vehicleId', 'vehicleNumber').lean();
      case 'payments':
        return Payment.find({ ...dateFilter, status: 'completed' }).lean();
      case 'customers':
        return Customer.find(dateFilter).lean();
      default:
        return [];
    }
  }
}

module.exports = new AnalyticsService();
