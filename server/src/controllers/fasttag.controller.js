const fastTagService = require('../services/fasttag.service');
const paymentService = require('../services/payment.service');

const fastTagController = {
  /**
   * POST /api/v1/fasttag/recharge
   * Initiate FastTag recharge (creates payment order and transaction record)
   */
  recharge: async (req, res, next) => {
    try {
      const { vehicleId, amount, paymentMethod } = req.body;
      const customerId = req.user.role === 'customer' ? req.user.profileId : req.body.customerId;

      // Create transaction record
      const transaction = await fastTagService.recharge({
        vehicleId, customerId, amount, paymentMethod,
        initiatedBy: req.userId,
      });

      // Create payment order
      const paymentOrder = await paymentService.createOrder({
        amount,
        purpose: 'fasttag_recharge',
        referenceType: 'fasttag',
        referenceId: transaction._id,
        payerId: customerId,
        payerType: 'customer',
        notes: { transactionId: transaction.transactionId, vehicleId },
      });

      res.status(201).json({
        success: true,
        data: {
          transaction,
          payment: paymentOrder,
        },
      });
    } catch (error) { next(error); }
  },

  /**
   * POST /api/v1/fasttag/confirm
   * Confirm recharge after payment verification
   */
  confirm: async (req, res, next) => {
    try {
      const { transactionId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      // Verify payment
      await paymentService.capturePayment({
        razorpayOrderId, razorpayPaymentId, razorpaySignature,
      });

      const transaction = await fastTagService.confirmRecharge(transactionId);
      res.status(200).json({ success: true, data: transaction });
    } catch (error) { next(error); }
  },

  /**
   * GET /api/v1/fasttag/balance/:vehicleId
   * Get FastTag balance for a vehicle
   */
  getBalance: async (req, res, next) => {
    try {
      const balance = await fastTagService.getBalance(req.params.vehicleId);
      res.status(200).json({ success: true, data: balance });
    } catch (error) { next(error); }
  },

  /**
   * GET /api/v1/fasttag/vehicle/:vehicleId/history
   * Get transaction history for a vehicle
   */
  getVehicleHistory: async (req, res, next) => {
    try {
      const result = await fastTagService.getVehicleHistory(req.params.vehicleId, req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  /**
   * GET /api/v1/fasttag
   * List all transactions (admin)
   */
  list: async (req, res, next) => {
    try {
      const result = await fastTagService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  /**
   * GET /api/v1/fasttag/:id
   * Get transaction by ID
   */
  getById: async (req, res, next) => {
    try {
      const transaction = await fastTagService.getById(req.params.id);
      res.status(200).json({ success: true, data: transaction });
    } catch (error) { next(error); }
  },

  /**
   * GET /api/v1/fasttag/stats
   * Get FastTag stats (admin)
   */
  getStats: async (req, res, next) => {
    try {
      const stats = await fastTagService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },
};

module.exports = fastTagController;
