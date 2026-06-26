const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  createBookingSchema, updateBookingStatusSchema, addExtraChargeSchema,
  addReviewSchema, listBookingsSchema, bookingIdParamSchema, chargeIdParamSchema,
} = require('../validators/booking.validator');

router.use(authenticate);

// Stats
router.get('/stats', authorize(roles.SUPER_ADMIN, roles.MANAGER), bookingController.getStats);

// CRUD
router.get('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR, roles.OPERATIONS), validate(listBookingsSchema, 'query'), bookingController.list);
router.post('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.CUSTOMER), validate(createBookingSchema), bookingController.create);
router.get('/:id', validate(bookingIdParamSchema, 'params'), bookingController.getById);
router.patch('/:id/status', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR, roles.FRANCHISE), validate(bookingIdParamSchema, 'params'), validate(updateBookingStatusSchema), bookingController.updateStatus);
router.patch('/:id/cancel', validate(bookingIdParamSchema, 'params'), bookingController.cancel);

// Extra charges
router.post('/:id/extra-charges', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.FRANCHISE), validate(bookingIdParamSchema, 'params'), validate(addExtraChargeSchema), bookingController.addExtraCharge);
router.patch('/:id/extra-charges/:chargeId/approve', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(chargeIdParamSchema, 'params'), bookingController.approveExtraCharge);

// Job card
router.post('/:id/job-card', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.FRANCHISE), validate(bookingIdParamSchema, 'params'), bookingController.generateJobCard);

// Review
router.post('/:id/review', authorize(roles.CUSTOMER), validate(bookingIdParamSchema, 'params'), validate(addReviewSchema), bookingController.addReview);

module.exports = router;
