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
const QRCode = require('../models/QRCode');
const Earnings = require('../models/Earnings');
const Lead = require('../models/Lead');
const AuditLog = require('../models/AuditLog');
const Admin = require('../models/Admin');
const mongoose = require('mongoose');

class DashboardService {

  /**
   * Full admin dashboard data — single endpoint that aggregates everything
   */
  async getAllDashboardData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalCustomers,
      totalCleaners,
      totalSupervisors,
      totalFranchises,
      totalVehicles,
      subscriptionsActive,
      subscriptionsTrial,
      subscriptionsExpired,
      subscriptionsCancelled,
      bookingsToday,
      bookingsYesterday,
      bookingsTotal,
      revenueTotalRaw,
      revenueTodayRaw,
      revenueYesterdayRaw,
      customersToday,
      customersYesterday,
      customersActive,
      customersInactive,
      cleanersVerified,
      cleanersPending,
      cleanersRejected,
      cleanersActiveCt,
      franchiseVerified,
      franchisePending,
      franchiseRejected,
      franchiseActiveCt,
      pendingApprovals,
      topCleanersData,
      recentActivities,
      bookingChartData,
      revenueChartData,
    ] = await Promise.all([
      Customer.countDocuments(),
      Cleaner.countDocuments(),
      Supervisor.countDocuments(),
      Franchise.countDocuments(),
      Vehicle.countDocuments({ isActive: true }),
      Subscription.countDocuments({ status: 'active' }),
      Subscription.countDocuments({ status: 'trial' }),
      Subscription.countDocuments({ status: 'expired' }),
      Subscription.countDocuments({ status: 'cancelled' }),
      // Bookings today & yesterday & total
      ServiceBooking.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      ServiceBooking.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
      ServiceBooking.countDocuments(),
      // Revenue total (all captured payments)
      Payment.aggregate([
        { $match: { status: 'captured' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // Revenue today
      Payment.aggregate([
        { $match: { status: 'captured', createdAt: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // Revenue yesterday
      Payment.aggregate([
        { $match: { status: 'captured', createdAt: { $gte: yesterday, $lt: today } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // Customer growth
      Customer.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Customer.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
      Customer.countDocuments({ subscriptionStatus: 'active' }),
      Customer.countDocuments({ subscriptionStatus: { $in: ['none', 'expired', 'cancelled'] } }),
      // Cleaners stats
      Cleaner.countDocuments({ verificationStatus: 'verified' }),
      Cleaner.countDocuments({ verificationStatus: 'pending' }),
      Cleaner.countDocuments({ verificationStatus: 'rejected' }),
      Cleaner.countDocuments({ isActive: true }),
      // Franchise stats
      Franchise.countDocuments({ verificationStatus: 'verified' }),
      Franchise.countDocuments({ verificationStatus: 'pending' }),
      Franchise.countDocuments({ verificationStatus: 'rejected' }),
      Franchise.countDocuments({ isActive: true }),
      // Pending approvals
      this._getPendingApprovals(),
      // Top cleaners
      this._getTopCleaners({ limit: 10 }),
      // Recent activities
      this._getRecentActivities(20),
      // Booking chart data (last 7 days by default)
      this._getBookingChartData(7),
      // Revenue chart data (last 7 days by default)
      this._getRevenueChartData(7),
    ]);

    // Query NCSP + supervisor + operations team (admin) stats
    const [ncspTotal, ncspActive, ncspPending, ncspInactive, supervisorsActive, supervisorsInactive,
      opsTotal, opsActive, opsInactive] = await Promise.all([
      NcspPartner.countDocuments(),
      NcspPartner.countDocuments({ isActive: true, verificationStatus: 'verified' }),
      NcspPartner.countDocuments({ verificationStatus: 'pending' }),
      NcspPartner.countDocuments({ isActive: false }),
      Supervisor.countDocuments({ isActive: true }),
      Supervisor.countDocuments({ isActive: false }),
      // Operations team = admins with role 'operations' or 'manager'
      Admin.countDocuments({ role: { $in: ['operations', 'manager', 'super_admin'] } }),
      Admin.countDocuments({ role: { $in: ['operations', 'manager', 'super_admin'] }, isActive: true }),
      Admin.countDocuments({ role: { $in: ['operations', 'manager', 'super_admin'] }, isActive: false }),
    ]);

    const revTotal   = revenueTotalRaw[0]?.total || 0;
    const revToday   = revenueTodayRaw[0]?.total || 0;
    const revYest    = revenueYesterdayRaw[0]?.total || 0;
    const revGrowth  = revYest > 0 ? ((revToday - revYest) / revYest) * 100 : 0;
    const bookingGrowth   = bookingsYesterday > 0 ? ((bookingsToday - bookingsYesterday) / bookingsYesterday) * 100 : 0;
    const customerGrowth  = customersYesterday > 0 ? ((customersToday - customersYesterday) / customersYesterday) * 100 : 0;

    return {
      kpiCards: {
        totalCustomers:     { value: totalCustomers,     today: customersToday, yesterday: customersYesterday, growth: parseFloat(customerGrowth.toFixed(1)) },
        activeSubscriptions:{ value: subscriptionsActive, trial: subscriptionsTrial, expired: subscriptionsExpired, cancelled: subscriptionsCancelled, growth: 0 },
        // Total bookings (not just today) — more meaningful KPI
        totalBookings:      { value: bookingsTotal,  today: bookingsToday, yesterday: bookingsYesterday, growth: parseFloat(bookingGrowth.toFixed(1)) },
        // Total revenue (all time) — more meaningful KPI
        totalRevenue:       { value: revTotal,  today: revToday, yesterday: revYest, growth: parseFloat(revGrowth.toFixed(1)) },
      },
      secondaryCards: {
        cleaners:         { total: totalCleaners,   active: cleanersActiveCt, pending: cleanersPending, inactive: totalCleaners - cleanersActiveCt, verified: cleanersVerified, rejected: cleanersRejected },
        supervisors:      { total: totalSupervisors, active: supervisorsActive, pending: 0, inactive: supervisorsInactive, verified: supervisorsActive, rejected: 0 },
        ncspPartners:     { total: ncspTotal, active: ncspActive, pending: ncspPending, inactive: ncspInactive, verified: ncspActive, rejected: Math.max(0, ncspTotal - ncspActive - ncspPending) },
        franchisePartners:{ total: totalFranchises, active: franchiseActiveCt, pending: franchisePending, inactive: totalFranchises - franchiseActiveCt, verified: franchiseVerified, rejected: franchiseRejected },
        operationsTeam:   { total: opsTotal, active: opsActive, pending: 0, inactive: opsInactive, verified: opsActive, rejected: 0 },
      },
      charts: {
        bookingOverview: bookingChartData,
        revenueOverview: revenueChartData,
        customerGrowth: {
          new:      customersToday,
          active:   customersActive,
          inactive: customersInactive,
        },
      },
      recentActivities,
      topCleaners: topCleanersData,
      pendingApprovals,
    };
  }

  /**
   * GET /api/dashboard/revenue?period=7d|30d|90d|1y
   */
  async getRevenueData(period = '7d') {
    const days = this._parsePeriod(period);
    const data = await this._getRevenueChartData(days);
    // Also get subscription vs booking vs lead breakdown
    const allPayments = await Payment.aggregate([
      { $match: { status: 'captured', createdAt: { $gte: new Date(Date.now() - days * 86400000) } } },
      {
        $group: {
          _id: '$purpose',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);
    return { chart: data, breakdown: allPayments };
  }

  /**
   * GET /api/dashboard/bookings?period=7d|30d|90d|1y
   */
  async getBookingsData(period = '7d') {
    const days = this._parsePeriod(period);
    const data = await this._getBookingChartData(days);
    // Status breakdown
    const statusBreakdown = await ServiceBooking.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - days * 86400000) } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    return { chart: data, breakdown: statusBreakdown };
  }

  /**
   * GET /api/dashboard/customers?period=7d|30d|90d|1y
   */
  async getCustomersData(period = '7d') {
    const days = this._parsePeriod(period);
    const since = new Date(Date.now() - days * 86400000);
    const [newCustomers, active, inactive, growthData] = await Promise.all([
      Customer.countDocuments({ createdAt: { $gte: since } }),
      Customer.countDocuments({ subscriptionStatus: 'active' }),
      Customer.countDocuments({ subscriptionStatus: { $in: ['none', 'expired', 'cancelled'] } }),
      Customer.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);
    return {
      newCustomers,
      activeCustomers: active,
      inactiveCustomers: inactive,
      growth: growthData.map(d => ({ date: d._id, count: d.count })),
    };
  }

  /**
   * GET /api/dashboard/activities?limit=20
   */
  async getRecentActivities(limit = 20) {
    return this._getRecentActivities(limit);
  }

  /**
   * GET /api/dashboard/top-cleaners?page=1&limit=10&sort=earnings&order=desc&search=
   */
  async getTopCleaners({ page = 1, limit = 10, sort = 'earnings', order = 'desc', search = '' } = {}) {
    const matchStage = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { cleanerId: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const sortField = sort === 'earnings' ? 'stats.totalEarnings' :
      sort === 'rating' ? 'stats.averageRating' :
      sort === 'jobs' ? 'stats.totalTasksCompleted' :
      sort === 'attendance' ? 'stats.attendancePercentage' : 'stats.totalEarnings';

    const sortOrder = order === 'asc' ? 1 : -1;

    const total = await Cleaner.countDocuments(matchStage);
    const cleaners = await Cleaner.aggregate([
      { $match: matchStage },
      { $sort: { [sortField]: sortOrder } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
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
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          cleanerId: 1,
          photo: 1,
          stats: 1,
          zone: { $ifNull: ['$zone.name', 'N/A'] },
        },
      },
    ]);

    return {
      cleaners: cleaners.map(c => ({
        _id: c._id,
        name: `${c.firstName} ${c.lastName || ''}`.trim(),
        cleanerId: c.cleanerId,
        photo: c.photo,
        completedJobs: c.stats?.totalTasksCompleted || 0,
        rating: c.stats?.averageRating || 0,
        earnings: c.stats?.totalEarnings || 0,
        attendancePercent: c.stats?.attendancePercentage || 0,
        zone: c.zone,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * GET /api/dashboard/pending-approvals
   */
  async getPendingApprovals() {
    return this._getPendingApprovals();
  }

  // ─── Private helpers ───

  _parsePeriod(period) {
    const map = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    return map[period] || 7;
  }

  async _getRevenueChartData(days) {
    const data = await Payment.aggregate([
      {
        $match: {
          status: 'captured',
          createdAt: { $gte: new Date(Date.now() - days * 86400000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          subscriptionRevenue: {
            $sum: { $cond: [{ $eq: ['$purpose', 'subscription'] }, '$amount', 0] },
          },
          bookingRevenue: {
            $sum: { $cond: [{ $eq: ['$purpose', 'service_booking'] }, '$amount', 0] },
          },
          leadRevenue: {
            $sum: { $cond: [{ $eq: ['$purpose', 'lead'] }, '$amount', 0] },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return data.map(d => ({
      date: d._id,
      subscriptionRevenue: d.subscriptionRevenue,
      bookingRevenue: d.bookingRevenue,
      leadRevenue: d.leadRevenue,
      total: d.total,
      count: d.count,
    }));
  }

  async _getBookingChartData(days) {
    const data = await ServiceBooking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - days * 86400000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
          pending: {
            $sum: {
              $cond: [{ $in: ['$status', ['booked', 'accepted', 'job_card_pending', 'job_card_approved']] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return data.map(d => ({
      date: d._id,
      total: d.total,
      completed: d.completed,
      cancelled: d.cancelled,
      pending: d.pending,
    }));
  }

  async _getRecentActivities(limit = 20) {
    // Get from AuditLog — fallback to generating from recent events
    const logs = await AuditLog.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          action: 1,
          description: 1,
          actorId: 1,
          actorRole: 1,
          targetType: 1,
          createdAt: 1,
          type: { $literal: 'audit' },
        },
      },
    ]);

    if (logs.length > 0) return logs.map(l => ({
      _id: l._id,
      type: l.targetType || l.action,
      description: l.description || `${l.action} on ${l.targetType}`,
      user: l.actorId,
      role: l.actorRole,
      time: l.createdAt,
      ago: this._timeAgo(l.createdAt),
    }));

    // Fallback: generate from recent bookings, payments, complaints
    const [recentBookings, recentPayments, recentComplaints, recentCleaners] = await Promise.all([
      ServiceBooking.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 1,
            bookingId: 1,
            status: 1,
            createdAt: 1,
            type: { $literal: 'booking' },
            action: { $concat: ['Booking ', '$status'] },
          },
        },
      ]),
      Payment.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 1,
            amount: 1,
            purpose: 1,
            status: 1,
            createdAt: 1,
            type: { $literal: 'payment' },
            action: { $concat: ['Payment ', '$status'] },
          },
        },
      ]),
      Complaint.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 1,
            ticketNumber: 1,
            status: 1,
            createdAt: 1,
            type: { $literal: 'complaint' },
            action: { $concat: ['Complaint ', '$status'] },
          },
        },
      ]),
      Cleaner.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            createdAt: 1,
            type: { $literal: 'cleaner' },
            action: { $literal: 'Cleaner Registered' },
          },
        },
      ]),
    ]);

    const activities = [
      ...recentBookings.map(b => ({ ...b, description: `Booking ${b.bookingId} - ${b.status}` })),
      ...recentPayments.map(p => ({ ...p, description: `Payment of ₹${p.amount} - ${p.purpose}` })),
      ...recentComplaints.map(c => ({ ...c, description: `Complaint ${c.ticketNumber} - ${c.status}` })),
      ...recentCleaners.map(cl => ({ ...cl, description: `${cl.firstName} ${cl.lastName || ''} registered as cleaner` })),
    ];

    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return activities.slice(0, limit).map(a => ({
      _id: a._id,
      type: a.type,
      description: a.description,
      time: a.createdAt,
      ago: this._timeAgo(a.createdAt),
    }));
  }

  async _getTopCleaners({ limit = 10 }) {
    return Cleaner.aggregate([
      { $match: { isActive: true, 'stats.totalTasksCompleted': { $gt: 0 } } },
      { $sort: { 'stats.totalEarnings': -1 } },
      { $limit: limit },
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
        $project: {
          _id: 1,
          name: { $concat: ['$firstName', ' ', { $ifNull: ['$lastName', ''] }] },
          cleanerId: 1,
          completedJobs: '$stats.totalTasksCompleted',
          rating: '$stats.averageRating',
          earnings: '$stats.totalEarnings',
          attendancePercent: '$stats.attendancePercentage',
          zone: { $ifNull: ['$zone.name', 'N/A'] },
          photo: 1,
        },
      },
    ]);
  }

  async _getPendingApprovals() {
    const [pendingCleaners, pendingSupervisors, pendingFranchises, pendingNCSP] = await Promise.all([
      Cleaner.countDocuments({ verificationStatus: 'pending' }),
      Supervisor.countDocuments({ isActive: true }),
      Franchise.countDocuments({ verificationStatus: 'pending' }),
      NcspPartner.countDocuments({ verificationStatus: 'pending' }),
    ]);

    const approvals = [];
    if (pendingCleaners > 0) approvals.push({ type: 'Car Cleaner', count: pendingCleaners, path: '/cleaners', status: 'pending' });
    if (pendingFranchises > 0) approvals.push({ type: 'Franchise Partner', count: pendingFranchises, path: '/franchises', status: 'pending' });
    if (pendingNCSP > 0) approvals.push({ type: 'NCSP Partner', count: pendingNCSP, path: '/ncsp', status: 'pending' });
    approvals.push({ type: 'Supervisor', count: pendingSupervisors, path: '/supervisors', status: 'verified' });
    approvals.push({ type: 'Operations Team', count: 0, path: '/cleaners', status: 'active' });
    return approvals;
  }

  _timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  }

  /**
   * Admin dashboard (existing, enhanced)
   */
  async getAdminDashboard() {
    const [overview, bookings, bookingTrend, pendingApprovals] = await Promise.all([
      this.getAllDashboardData(),
      this.getBookingsData('30d'),
      this._getBookingChartData(30),
      this.getPendingApprovals(),
    ]);

    return {
      ...overview,
      charts: {
        ...overview.charts,
        bookingTrend: bookingTrend.map(b => ({ date: b.date, bookings: b.total })),
      },
      pendingApprovals,
    };
  }

  /**
   * Cleaner dashboard (existing)
   */
  async getCleanerDashboard(userOrCleanerId) {
    let cleaner = await Cleaner.findOne({ userId: userOrCleanerId });
    if (!cleaner) cleaner = await Cleaner.findById(userOrCleanerId);
    const cleanerObjectId = cleaner?._id;
    if (!cleaner) return { error: 'Cleaner not found' };

    const [tasks, todayTasks, attendanceThisMonth, earningsData] = await Promise.all([
      Task.aggregate([{ $match: { cleanerId: cleanerObjectId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.countDocuments({ cleanerId: cleanerObjectId, scheduledDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)), $lte: new Date(new Date().setHours(23, 59, 59, 999)) } }),
      Attendance.countDocuments({ cleanerId: cleanerObjectId, date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
      Earnings.aggregate([{ $match: { cleanerId: cleanerObjectId } }, { $group: { _id: null, total: { $sum: '$netAmount' }, pending: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, '$netAmount', 0] } } } }]),
    ]);

    const taskStats = { assigned: 0, inProgress: 0, completed: 0, missed: 0 };
    tasks.forEach(t => { if (t._id === 'assigned') taskStats.assigned = t.count; else if (t._id === 'in_progress') taskStats.inProgress = t.count; else if (t._id === 'completed') taskStats.completed = t.count; else if (t._id === 'missed') taskStats.missed = t.count; });

    return {
      profile: cleaner ? { name: `${cleaner.firstName} ${cleaner.lastName || ''}`, cleanerId: cleaner.cleanerId, zone: cleaner.assignedZone?.name || 'N/A', rating: cleaner.stats?.averageRating || 0, employmentType: cleaner.employmentType } : null,
      tasks: { ...taskStats, total: taskStats.assigned + taskStats.inProgress + taskStats.completed + taskStats.missed, todayTasks },
      earnings: { total: earningsData[0]?.total || 0, pending: earningsData[0]?.pending || 0 },
      attendance: { thisMonth: attendanceThisMonth },
    };
  }

  /**
   * Customer dashboard (existing)
   */
  async getCustomerDashboard(customerId) {
    const [customer, vehicles, bookings, payments, subscription] = await Promise.all([
      Customer.findById(customerId),
      Vehicle.countDocuments({ customerId, isActive: true }),
      ServiceBooking.aggregate([{ $match: { customerId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Payment.aggregate([{ $match: { payerId: customerId, payerType: 'Customer', status: 'captured' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Subscription.findOne({ customerId }).sort({ createdAt: -1 }).select('status endDate'),
    ]);

    const bookingStats = { total: 0, completed: 0, inProgress: 0, cancelled: 0 };
    bookings.forEach(b => { bookingStats.total += b.count; if (b._id === 'completed') bookingStats.completed = b.count; else if (b._id === 'in_progress') bookingStats.inProgress = b.count; else if (b._id === 'cancelled') bookingStats.cancelled = b.count; });

    return {
      profile: customer ? { name: `${customer.firstName} ${customer.lastName || ''}`, phone: customer.phone, totalCleanings: customer.totalCleanings || 0, cleaningBalance: customer.cleaningBalance || 0 } : null,
      vehicles: { total: vehicles },
      bookings: bookingStats,
      payments: { total: payments[0]?.total || 0, count: payments[0]?.count || 0 },
      subscription: subscription ? { status: subscription.status, endDate: subscription.endDate } : { status: 'none' },
    };
  }

  /**
   * Franchise dashboard (existing)
   */
  async getFranchiseDashboard(franchiseId) {
    const [franchise, cleaners, bookings, revenue] = await Promise.all([
      Franchise.findById(franchiseId),
      Cleaner.countDocuments({ assignedZone: { $in: franchiseId }, isActive: true }),
      ServiceBooking.aggregate([{ $match: { franchiseId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      ServiceBooking.aggregate([{ $match: { franchiseId, status: 'completed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]),
    ]);

    const bookingStats = { total: 0, active: 0, completed: 0 };
    bookings.forEach(b => { bookingStats.total += b.count; if (b._id === 'completed') bookingStats.completed = b.count; else if (['booked', 'accepted', 'in_progress'].includes(b._id)) bookingStats.active += b.count; });

    return {
      profile: franchise ? { name: franchise.franchiseName, owner: franchise.ownerName, type: franchise.type, verificationStatus: franchise.verificationStatus, commission: franchise.agreement?.commissionPercent || 0 } : null,
      cleaners: { total: cleaners },
      bookings: bookingStats,
      revenue: { total: revenue[0]?.total || 0, count: revenue[0]?.count || 0, commission: franchise?.agreement?.commissionPercent ? Math.round((revenue[0]?.total || 0) * franchise.agreement.commissionPercent / 100) : 0 },
      stats: franchise?.stats || {},
    };
  }
}

module.exports = new DashboardService();
