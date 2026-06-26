const Joi = require('joi');

const rechargeSchema = Joi.object({
  vehicleId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  amount: Joi.number().positive().required(),
  paymentMethod: Joi.string().valid('razorpay', 'wallet', 'cash', 'upi').default('razorpay'),
  customerId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
});

const confirmRechargeSchema = Joi.object({
  transactionId: Joi.string().required(),
  razorpayOrderId: Joi.string().required(),
  razorpayPaymentId: Joi.string().required(),
  razorpaySignature: Joi.string().required(),
});

const listTransactionsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('pending', 'success', 'failed', 'refunded'),
  type: Joi.string().valid('recharge', 'toll_deduction', 'refund'),
  vehicleId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  customerId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  fromDate: Joi.date().iso(),
  toDate: Joi.date().iso(),
});

const fastTagIdParamSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
});

const vehicleIdParamSchema = Joi.object({
  vehicleId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
});

module.exports = {
  rechargeSchema,
  confirmRechargeSchema,
  listTransactionsSchema,
  fastTagIdParamSchema,
  vehicleIdParamSchema,
};
