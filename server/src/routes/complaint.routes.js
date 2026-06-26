const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  createComplaintSchema, assignComplaintSchema, resolveComplaintSchema,
  closeComplaintSchema, updatePrioritySchema, listComplaintsSchema,
  complaintIdParamSchema, ticketNumberParamSchema,
} = require('../validators/complaint.validator');

router.use(authenticate);

// Customer-facing
router.post('/', authorize(roles.CUSTOMER, roles.SUPER_ADMIN, roles.MANAGER, roles.FRANCHISE), validate(createComplaintSchema), complaintController.create);
router.get('/ticket/:ticketNumber', validate(ticketNumberParamSchema, 'params'), complaintController.getByTicket);

// Admin routes
router.get('/stats', authorize(roles.SUPER_ADMIN, roles.MANAGER), complaintController.getStats);
router.get('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR, roles.OPERATIONS, roles.FRANCHISE), validate(listComplaintsSchema, 'query'), complaintController.list);
router.get('/:id', validate(complaintIdParamSchema, 'params'), complaintController.getById);
router.patch('/:id/assign', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(complaintIdParamSchema, 'params'), validate(assignComplaintSchema), complaintController.assign);
router.patch('/:id/resolve', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(complaintIdParamSchema, 'params'), validate(resolveComplaintSchema), complaintController.resolve);
router.patch('/:id/close', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(complaintIdParamSchema, 'params'), validate(closeComplaintSchema), complaintController.close);
router.patch('/:id/priority', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(complaintIdParamSchema, 'params'), validate(updatePrioritySchema), complaintController.updatePriority);

module.exports = router;
