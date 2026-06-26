const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');

router.use(authenticate);
router.use(authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS));

router.get('/dashboard', analyticsController.getDashboard);
router.get('/revenue', analyticsController.getRevenueReport);
router.get('/cleaner-productivity', analyticsController.getCleanerProductivity);
router.get('/export', analyticsController.getExport);

module.exports = router;
