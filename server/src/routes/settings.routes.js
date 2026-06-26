const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');

// Public settings — accessible without authentication (used by login page)
router.get('/public', settingsController.getPublicSettings);

router.use(authenticate);
router.use(authorize(roles.SUPER_ADMIN, roles.MANAGER));

router.get('/', settingsController.getAll);
router.get('/:group', settingsController.getByGroup);
router.put('/:group', settingsController.updateGroup);
router.post('/', settingsController.update);
router.delete('/:group/:key', settingsController.delete);

module.exports = router;
