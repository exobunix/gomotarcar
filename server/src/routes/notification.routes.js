const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  sendNotificationSchema, sendBulkSchema, listNotificationsSchema,
  listForUserSchema, notificationIdParamSchema, userIdParamSchema,
} = require('../validators/notification.validator');

router.use(authenticate);

// User-facing
router.get('/user/:userId', validate(userIdParamSchema, 'params'), validate(listForUserSchema, 'query'), notificationController.listForUser);
router.get('/user/:userId/unread', validate(userIdParamSchema, 'params'), notificationController.getUnreadCount);
router.patch('/:id/read', validate(notificationIdParamSchema, 'params'), notificationController.markAsRead);
router.patch('/user/:userId/read-all', validate(userIdParamSchema, 'params'), notificationController.markAllAsRead);

// Admin routes
router.get('/stats', authorize(roles.SUPER_ADMIN, roles.MANAGER), notificationController.getStats);
router.get('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(listNotificationsSchema, 'query'), notificationController.list);
router.post('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(sendNotificationSchema), notificationController.send);
router.post('/bulk', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(sendBulkSchema), notificationController.sendBulk);
router.delete('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(notificationIdParamSchema, 'params'), notificationController.delete);

module.exports = router;
