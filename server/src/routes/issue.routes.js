const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issue.controller');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');

router.use(authenticate);

router.get('/stats', authorize(roles.SUPER_ADMIN, roles.MANAGER), issueController.getStats);
router.get('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR, roles.OPERATIONS, roles.CLEANER), issueController.list);
router.post('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR, roles.CLEANER), issueController.create);
router.get('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR, roles.CLEANER), issueController.getById);
router.patch('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR, roles.CLEANER), issueController.update);
router.delete('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER), issueController.delete);

module.exports = router;
