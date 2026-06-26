const Joi = require('joi');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const sendPushSchema = Joi.object({
  title: Joi.string().required(),
  body: Joi.string().required(),
  type: Joi.string().valid('task_assignment', 'task_reminder', 'attendance_alert', 'issue_update', 'payment_update', 'leave_status', 'incentive', 'booking_update', 'subscription_reminder', 'complaint_update', 'announcement', 'training', 'system').default('system'),
  data: Joi.object().optional(),
  priority: Joi.string().valid('low', 'normal', 'high').default('high'),
});

const updateTokenSchema = Joi.object({
  fcmToken: Joi.string().required(),
  deviceId: Joi.string().allow('', null),
});

const topicSchema = Joi.object({
  topic: Joi.string().required(),
  title: Joi.string().required(),
  body: Joi.string().required(),
  data: Joi.object().optional(),
});

const subscribeTopicSchema = Joi.object({
  fcmTokens: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).required(),
  topic: Joi.string().required(),
});

const userIdParamSchema = Joi.object({ userId: Joi.string().pattern(objectIdPattern).required() });
const roleParamSchema = Joi.object({ role: Joi.string().valid('super_admin', 'manager', 'supervisor', 'operations', 'franchise', 'cleaner', 'customer').required() });

module.exports = { sendPushSchema, updateTokenSchema, topicSchema, subscribeTopicSchema, userIdParamSchema, roleParamSchema };
