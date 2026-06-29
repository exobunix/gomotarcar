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

// All routes require super_admin, manager, or operations
router.use(authenticate);
router.use(authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS));

// Stats
router.get('/stats', supervisorController.getStats);

// Migration: Set random passwords for supervisors without one
router.post('/fix-passwords', async (req, res, next) => {
  try {
    const User = require('../models/User');
    const crypto = require('crypto');
    const supervisors = await User.find({ role: 'supervisor' });
    let updatedCount = 0;
    for (const sup of supervisors) {
      if (!sup.passwordHash || sup.passwordHash.trim() === '') {
        const randomPassword = crypto.randomBytes(3).toString('hex'); // 6 chars random password
        await User.findByIdAndUpdate(sup._id, { passwordHash: randomPassword });
        updatedCount++;
      }
    }
    res.status(200).json({ success: true, message: `Updated ${updatedCount} supervisors with a temporary random password.` });
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
