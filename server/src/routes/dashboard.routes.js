const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');

// All dashboard routes require auth
router.use(authenticate);

// ─── Admin Dashboard Routes ───

// GET /api/v1/dashboard/all — ALL dashboard data in one call (most efficient)
router.get('/all', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), dashboardController.getAllDashboardData);

// GET /api/v1/dashboard/admin — full platform overview (legacy)
router.get('/admin', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), dashboardController.getAdminDashboard);

// GET /api/v1/dashboard/revenue?period=7d|30d|90d|1y
router.get('/revenue', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), dashboardController.getRevenue);

// GET /api/v1/dashboard/bookings?period=7d|30d|90d|1y
router.get('/bookings', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), dashboardController.getBookings);

// GET /api/v1/dashboard/customers?period=7d|30d|90d|1y
router.get('/customers', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), dashboardController.getCustomers);

// GET /api/v1/dashboard/activities?limit=20
router.get('/activities', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), dashboardController.getActivities);

// GET /api/v1/dashboard/top-cleaners?page=1&limit=10&sort=earnings&order=desc&search=
router.get('/top-cleaners', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), dashboardController.getTopCleaners);

// GET /api/v1/dashboard/pending-approvals
router.get('/pending-approvals', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), dashboardController.getPendingApprovals);

// ─── Role-based dashboards ───

// Cleaner dashboard
router.get('/cleaner', authorize(roles.CLEANER, roles.SUPER_ADMIN, roles.MANAGER), dashboardController.getCleanerDashboard);
router.get('/cleaner/:userId', authorize(roles.SUPER_ADMIN, roles.MANAGER), dashboardController.getCleanerDashboard);

// Customer dashboard
router.get('/customer', authorize(roles.CUSTOMER, roles.SUPER_ADMIN, roles.MANAGER), dashboardController.getCustomerDashboard);
router.get('/customer/:userId', authorize(roles.SUPER_ADMIN, roles.MANAGER), dashboardController.getCustomerDashboard);

// Franchise dashboard
router.get('/franchise', authorize(roles.FRANCHISE, roles.SUPER_ADMIN, roles.MANAGER), dashboardController.getFranchiseDashboard);
router.get('/franchise/:userId', authorize(roles.SUPER_ADMIN, roles.MANAGER), dashboardController.getFranchiseDashboard);

module.exports = router;
