const Joi = require('joi');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createOrderSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().default('INR'),
  receipt: Joi.string().allow('', null),
  notes: Joi.object().optional(),
  purpose: Joi.string().valid('subscription', 'service_booking', 'fasttag_recharge', 'cleaner_payout', 'incentive_payout', 'refund', 'wallet_topup').optional(),
  referenceType: Joi.string().valid('subscription', 'service_booking', 'fasttag', 'earnings').optional(),
  referenceId: Joi.string().pattern(objectIdPattern).optional(),
  payerId: Joi.string().pattern(objectIdPattern).optional(),
  payerType: Joi.string().valid('customer', 'admin', 'franchise').default('customer'),
});

const verifyPaymentSchema = Joi.object({
  razorpayOrderId: Joi.string().required(),
  razorpayPaymentId: Joi.string().required(),
  razorpaySignature: Joi.string().required(),
});

const refundSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  reason: Joi.string().max(500).allow('', null),
});

const listPaymentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('created', 'captured', 'refunded', 'failed', 'partial_refunded'),
  purpose: Joi.string().valid('subscription', 'service_booking', 'fasttag_recharge', 'cleaner_payout', 'incentive_payout', 'refund', 'wallet_topup'),
  payerId: Joi.string().pattern(objectIdPattern),
  fromDate: Joi.date(),
  toDate: Joi.date(),
});

const paymentIdParamSchema = Joi.object({ id: Joi.string().pattern(objectIdPattern).required() });
const orderIdParamSchema = Joi.object({ orderId: Joi.string().required() });

const walletTopUpSchema = Joi.object({
  ownerType: Joi.string().valid('customer', 'cleaner', 'franchise').required(),
  ownerId: Joi.string().pattern(objectIdPattern).required(),
  amount: Joi.number().positive().required(),
});

const completeTopUpSchema = Joi.object({
  razorpayOrderId: Joi.string().required(),
  razorpayPaymentId: Joi.string().required(),
  razorpaySignature: Joi.string().required(),
});

module.exports = { createOrderSchema, verifyPaymentSchema, refundSchema, listPaymentsSchema, paymentIdParamSchema, orderIdParamSchema, walletTopUpSchema, completeTopUpSchema };
