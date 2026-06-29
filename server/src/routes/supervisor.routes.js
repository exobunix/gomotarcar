const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/supervisor.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  createSupervisorSchema,
  updateSupervisorSchema,
  listSupervisorsSchema,
  supervisorIdParamSchema,
} = require('../validators/supervisor.validator');

// ─────────────────────────────────────────────
// PUBLIC SUPERVISOR SELF-SERVICE ROUTES (require only supervisor role)
// ─────────────────────────────────────────────
router.get('/profile', authenticate, authorize(roles.SUPERVISOR), async (req, res, next) => {
  try {
    const Supervisor = require('../models/Supervisor');
    const supervisor = await Supervisor.findOne({ userId: req.userId })
      .populate('userId', 'phone email isActive')
      .populate('assignedZone', 'name city');
    if (!supervisor) {
      return res.status(404).json({ success: false, error: { code: 'SUPERVISOR_NOT_FOUND', message: 'Supervisor profile not found' } });
    }
    res.status(200).json({ success: true, data: supervisor });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', authenticate, authorize(roles.SUPERVISOR), async (req, res, next) => {
  try {
    const Supervisor = require('../models/Supervisor');
    const supervisor = await Supervisor.findOne({ userId: req.userId });
    if (!supervisor) {
      return res.status(404).json({ success: false, error: { code: 'SUPERVISOR_NOT_FOUND', message: 'Supervisor profile not found' } });
    }
    const allowedFields = ['firstName', 'lastName', 'photo'];
    allowedFields.forEach(f => { if (req.body[f] !== undefined) supervisor[f] = req.body[f]; });
    await supervisor.save();
    res.status(200).json({ success: true, data: supervisor });
  } catch (error) {
    next(error);
  }
});

router.get('/me/stats', authenticate, authorize(roles.SUPERVISOR), async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: { stats: {} } });
  } catch (error) {
    next(error);
  }
});

router.get('/me/cleaners', authenticate, authorize(roles.SUPERVISOR), async (req, res, next) => {
  try {
    const Supervisor = require('../models/Supervisor');
    const Cleaner = require('../models/Cleaner');
    const supervisor = await Supervisor.findOne({ userId: req.userId });
    if (!supervisor) {
      return res.status(404).json({ success: false, error: { code: 'SUPERVISOR_NOT_FOUND', message: 'Supervisor not found' } });
    }
    const cleaners = await Cleaner.find({ supervisorId: req.userId }).populate('userId', 'phone email');
    res.status(200).json({ success: true, data: cleaners });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// TEMPORARY PUBLIC MIGRATION ROUTE
// ─────────────────────────────────────────────
router.post('/fix-passwords', async (req, res, next) => {
  try {
    const User = require('../models/User');
    const Supervisor = require('../models/Supervisor');
    const bcrypt = require('bcryptjs');
    const supervisors = await Supervisor.find().populate('userId');
    const results = [];

    for (const sup of supervisors) {
      const user = sup.userId;
      if (!user || user.role !== 'supervisor') continue;

      const firstName = sup.firstName ? sup.firstName.replace(/\s+/g, '') : 'Supervisor';
      const newPassword = `${firstName}@123`;
      const hash = await bcrypt.hash(newPassword, 12);
      
      await User.collection.updateOne(
        { _id: user._id },
        { $set: { passwordHash: hash, updatedAt: new Date() } }
      );
      results.push({ phone: user.phone, name: firstName, password: newPassword });
    }

    res.status(200).json({
      success: true,
      message: `Reset passwords for ${results.length} supervisors`,
      data: results
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// ADMIN-ONLY ROUTES (super_admin, manager, operations)
// ─────────────────────────────────────────────
router.use(authenticate);
router.use(authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS));

// Stats
router.get('/stats', supervisorController.getStats);

// Reset a single supervisor's password
router.post('/reset-password/:phone', async (req, res, next) => {
  try {
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    const { newPassword } = req.body;
    const phone = decodeURIComponent(req.params.phone);

    const user = await User.findOne({ phone, role: 'supervisor' });
    if (!user) {
      return res.status(404).json({ success: false, error: { message: `No supervisor found with phone ${phone}` } });
    }

    const password = newPassword || `Super${String(phone).slice(-4)}`;
    const hash = await bcrypt.hash(password, 12);
    await User.collection.updateOne(
      { _id: user._id },
      { $set: { passwordHash: hash, updatedAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: { phone, newPassword: password }
    });
  } catch (error) {
    next(error);
  }
});

// CRUD
router.get('/', validate(listSupervisorsSchema, 'query'), supervisorController.list);
router.post('/', validate(createSupervisorSchema), supervisorController.create);
router.get('/:id', validate(supervisorIdParamSchema, 'params'), supervisorController.getById);
router.put('/:id', validate(supervisorIdParamSchema, 'params'), validate(updateSupervisorSchema), supervisorController.update);
router.patch('/:id/deactivate', validate(supervisorIdParamSchema, 'params'), supervisorController.deactivate);
router.patch('/:id/verify', validate(supervisorIdParamSchema, 'params'), supervisorController.verify);
router.delete('/:id', validate(supervisorIdParamSchema, 'params'), supervisorController.delete);

// Supervisor-specific
router.get('/:id/cleaners', validate(supervisorIdParamSchema, 'params'), supervisorController.getCleaners);

// Custom Allocations & Work approvals
router.post('/:id/allocate-apartment', validate(supervisorIdParamSchema, 'params'), supervisorController.allocateApartment);
router.post('/:id/allocate-cleaner', validate(supervisorIdParamSchema, 'params'), supervisorController.allocateCleaner);
router.post('/:id/allocate-qr', validate(supervisorIdParamSchema, 'params'), supervisorController.allocateQr);
router.post('/:id/approve-work', validate(supervisorIdParamSchema, 'params'), supervisorController.approveWork);
router.post('/:id/reject-work', validate(supervisorIdParamSchema, 'params'), supervisorController.rejectWork);

module.exports = router;
