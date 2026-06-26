const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  checkInSchema, checkOutSchema, markAbsentSchema,
  listAttendanceSchema, attendanceIdParamSchema, cleanerIdParamSchema,
} = require('../validators/attendance.validator');

// Cleaner self check-in/out (uses req.userId from auth)
router.post('/checkin', authenticate, validate(checkInSchema), attendanceController.checkIn);
router.post('/checkout', authenticate, validate(checkOutSchema), attendanceController.checkOut);

// Admin & Cleaner shared routes (authenticated only)
router.use(authenticate);
router.get('/cleaner/:cleanerId/today', validate(cleanerIdParamSchema, 'params'), attendanceController.getToday);
router.get('/cleaner/:cleanerId/monthly/:month/:year', attendanceController.getMonthlySummary);

// Admin-only routes
router.use(authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR, roles.OPERATIONS));

// Stats
router.get('/stats', attendanceController.getStats);

// CRUD
router.get('/', validate(listAttendanceSchema, 'query'), attendanceController.list);
router.get('/:id', validate(attendanceIdParamSchema, 'params'), attendanceController.getById);

// Admin check-in/check-out (on behalf of cleaner)
router.post('/cleaner/:cleanerId/checkin', validate(cleanerIdParamSchema, 'params'), validate(checkInSchema), attendanceController.checkInForCleaner);
router.post('/cleaner/:cleanerId/checkout', validate(cleanerIdParamSchema, 'params'), validate(checkOutSchema), attendanceController.checkOutForCleaner);
router.post('/cleaner/:cleanerId/mark-absent', validate(cleanerIdParamSchema, 'params'), validate(markAbsentSchema), attendanceController.markAbsent);

module.exports = router;
