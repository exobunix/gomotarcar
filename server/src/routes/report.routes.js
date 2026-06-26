const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');

// All report routes require authentication
router.use(authenticate);
router.use(authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS));

// Report endpoints
router.get('/summary', reportController.getSummary);
router.get('/revenue', reportController.getRevenue);
router.get('/bookings', reportController.getBookings);
router.get('/cleaners', reportController.getCleaners);
router.get('/customers', reportController.getCustomers);

// Export endpoint: /api/reports/export/revenue?format=csv
router.get('/export/:reportType', reportController.getExport);

module.exports = router;
