const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  createOrderSchema, verifyPaymentSchema, refundSchema,
  listPaymentsSchema, paymentIdParamSchema, orderIdParamSchema,
  walletTopUpSchema, completeTopUpSchema,
} = require('../validators/payment.validator');

// Webhook - no auth (signed by Razorpay)
router.post('/webhook', paymentController.webhook);

// Protected routes
router.use(authenticate);

// Order creation
router.post('/create-order', validate(createOrderSchema), paymentController.createOrder);
router.post('/verify', validate(verifyPaymentSchema), paymentController.verifyPayment);

// Wallet top-up
router.post('/wallet-topup', validate(walletTopUpSchema), paymentController.walletTopUp);
router.post('/complete-topup', validate(completeTopUpSchema), paymentController.completeWalletTopUp);

// Admin routes
router.get('/stats', authorize(roles.SUPER_ADMIN, roles.MANAGER), paymentController.getStats);
router.get('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(listPaymentsSchema, 'query'), paymentController.list);
router.get('/order/:orderId', validate(orderIdParamSchema, 'params'), paymentController.getByOrderId);
router.get('/:id', validate(paymentIdParamSchema, 'params'), paymentController.getById);
router.post('/:id/refund', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(paymentIdParamSchema, 'params'), validate(refundSchema), paymentController.refund);

module.exports = router;
