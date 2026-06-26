const express = require('express');
const router = express.Router();
const pushController = require('../controllers/push.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  sendPushSchema, updateTokenSchema, topicSchema,
  subscribeTopicSchema, userIdParamSchema, roleParamSchema,
} = require('../validators/push.validator');

router.use(authenticate);

// Token management (user self-service)
router.post('/token', validate(updateTokenSchema), pushController.updateToken);
router.delete('/token', pushController.removeToken);

// Send
router.post('/test', pushController.sendTest);
router.post('/user/:userId', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(userIdParamSchema, 'params'), validate(sendPushSchema), pushController.sendToUser);
router.post('/role/:role', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(roleParamSchema, 'params'), validate(sendPushSchema), pushController.sendToRole);
router.post('/topic', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(topicSchema), pushController.sendToTopic);

// Topic management
router.post('/subscribe', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(subscribeTopicSchema), pushController.subscribeToTopic);
router.post('/unsubscribe', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(subscribeTopicSchema), pushController.unsubscribeFromTopic);

module.exports = router;
