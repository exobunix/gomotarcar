const dashboardService = require('../services/dashboard.service');

const dashboardController = {
  // GET /api/dashboard/admin — full platform overview
  getAdminDashboard: async (req, res, next) => {
    try {
      const data = await dashboardService.getAllDashboardData();
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },

  // GET /api/dashboard/revenue?period=7d|30d|90d|1y
  getRevenue: async (req, res, next) => {
    try {
      const { period = '7d' } = req.query;
      const data = await dashboardService.getRevenueData(period);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },

  // GET /api/dashboard/bookings?period=7d|30d|90d|1y
  getBookings: async (req, res, next) => {
    try {
      const { period = '7d' } = req.query;
      const data = await dashboardService.getBookingsData(period);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },

  // GET /api/dashboard/customers?period=7d|30d|90d|1y
  getCustomers: async (req, res, next) => {
    try {
      const { period = '7d' } = req.query;
      const data = await dashboardService.getCustomersData(period);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },

  // GET /api/dashboard/activities?limit=20
  getActivities: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const data = await dashboardService.getRecentActivities(limit);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },

  // GET /api/dashboard/top-cleaners?page=1&limit=10&sort=earnings&order=desc&search=
  getTopCleaners: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, sort = 'earnings', order = 'desc', search = '' } = req.query;
      const data = await dashboardService.getTopCleaners({
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        order,
        search,
      });
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },

  // GET /api/dashboard/pending-approvals
  getPendingApprovals: async (req, res, next) => {
    try {
      const data = await dashboardService.getPendingApprovals();
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },

  // GET /api/dashboard/all — ALL dashboard data in one call
  getAllDashboardData: async (req, res, next) => {
    try {
      const data = await dashboardService.getAllDashboardData();
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },

  // Existing role-based dashboards
  getCleanerDashboard: async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user?.id;
      const data = await dashboardService.getCleanerDashboard(userId);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },

  getCustomerDashboard: async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user?.id;
      const data = await dashboardService.getCustomerDashboard(userId);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },

  getFranchiseDashboard: async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user?.id;
      const data = await dashboardService.getFranchiseDashboard(userId);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },
};

module.exports = dashboardController;
