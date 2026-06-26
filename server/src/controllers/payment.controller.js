const paymentService = require('../services/payment.service');
const walletService = require('../services/wallet.service');

const paymentController = {
  createOrder: async (req, res, next) => {
    try {
      const order = await paymentService.createOrder(req.body);
      res.status(201).json({ success: true, data: order });
    } catch (error) { next(error); }
  },

  verifyPayment: async (req, res, next) => {
    try {
      const payment = await paymentService.capturePayment(req.body);
      res.status(200).json({ success: true, data: payment });
    } catch (error) { next(error); }
  },

  refund: async (req, res, next) => {
    try {
      const result = await paymentService.refund({ paymentId: req.params.id, ...req.body });
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  list: async (req, res, next) => {
    try {
      const result = await paymentService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  getById: async (req, res, next) => {
    try {
      const payment = await paymentService.getById(req.params.id);
      res.status(200).json({ success: true, data: payment });
    } catch (error) { next(error); }
  },

  getByOrderId: async (req, res, next) => {
    try {
      const payment = await paymentService.getByOrderId(req.params.orderId);
      res.status(200).json({ success: true, data: payment });
    } catch (error) { next(error); }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await paymentService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },

  webhook: async (req, res, next) => {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const isValid = paymentService.verifyWebhookSignature(req.body, signature);
      if (!isValid) {
        return res.status(400).json({ success: false, error: { code: 'WEBHOOK_INVALID_SIG', message: 'Invalid webhook signature' } });
      }
      await paymentService.handleWebhook(req.body.event, req.body.payload);
      res.status(200).json({ success: true });
    } catch (error) { next(error); }
  },

  // Wallet top-up flow
  walletTopUp: async (req, res, next) => {
    try {
      const { ownerType, ownerId, amount } = req.body;
      const order = await walletService.topUp(ownerType, ownerId, amount, { payerId: req.userId });
      res.status(201).json({ success: true, data: order });
    } catch (error) { next(error); }
  },

  completeWalletTopUp: async (req, res, next) => {
    try {
      const result = await walletService.completeTopUp(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },
};

module.exports = paymentController;
