const express = require('express');
const router = express.Router();
const incentiveController = require('../controllers/incentive.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  calculateMonthlySchema, calculateAllMonthlySchema, listIncentivesSchema,
  leaderboardSchema, incentiveIdParamSchema, cleanerMonthParamSchema, markPaidSchema,
} = require('../validators/incentive.validator');

router.use(authenticate);

// Public (read) - cleaner can see own incentives
router.get('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(listIncentivesSchema, 'query'), incentiveController.list);
router.get('/leaderboard', validate(leaderboardSchema, 'query'), incentiveController.getLeaderboard);
router.get('/stats', authorize(roles.SUPER_ADMIN, roles.MANAGER), incentiveController.getStats);
router.get('/:id', validate(incentiveIdParamSchema, 'params'), incentiveController.getById);
router.get('/cleaner/:cleanerId/:month/:year', validate(cleanerMonthParamSchema, 'params'), incentiveController.getCleanerMonth);

// Admin (write)
router.post('/calculate', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(calculateMonthlySchema), incentiveController.calculateMonthly);
router.post('/calculate-all', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(calculateAllMonthlySchema), incentiveController.calculateAllMonthly);
router.patch('/:id/mark-paid', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(incentiveIdParamSchema, 'params'), validate(markPaidSchema), incentiveController.markAsPaid);

module.exports = router;
