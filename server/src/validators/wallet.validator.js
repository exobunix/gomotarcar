const Joi = require('joi');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const ownerParamSchema = Joi.object({
  ownerType: Joi.string().valid('customer', 'cleaner', 'franchise').required(),
  ownerId: Joi.string().pattern(objectIdPattern).required(),
});

const walletDeductSchema = Joi.object({
  amount: Joi.number().positive().required(),
  purpose: Joi.string().valid('wallet_topup', 'payment', 'refund', 'payout', 'incentive', 'bonus', 'adjustment', 'fee_deduction').optional(),
  referenceType: Joi.string().valid('payment', 'subscription', 'booking', 'payout', 'earnings').optional(),
  referenceId: Joi.string().pattern(objectIdPattern).optional(),
  description: Joi.string().max(500).allow('', null),
});

const walletCreditSchema = Joi.object({
  amount: Joi.number().positive().required(),
  purpose: Joi.string().valid('wallet_topup', 'payment', 'refund', 'payout', 'incentive', 'bonus', 'adjustment', 'fee_deduction').optional(),
  referenceType: Joi.string().valid('payment', 'subscription', 'booking', 'payout', 'earnings').optional(),
  referenceId: Joi.string().pattern(objectIdPattern).optional(),
  description: Joi.string().max(500).allow('', null),
});

const transferSchema = Joi.object({
  fromWalletId: Joi.string().pattern(objectIdPattern).required(),
  toWalletId: Joi.string().pattern(objectIdPattern).required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().max(500).allow('', null),
});

const listTransactionsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  type: Joi.string().valid('credit', 'debit'),
  purpose: Joi.string(),
});

const walletIdParamSchema = Joi.object({ id: Joi.string().pattern(objectIdPattern).required() });

module.exports = { ownerParamSchema, walletDeductSchema, walletCreditSchema, transferSchema, listTransactionsSchema, walletIdParamSchema };
