const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zone.controller');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');

router.use(authenticate);
router.use(authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS));

router.get('/stats', zoneController.getStats);
router.get('/', zoneController.list);
router.post('/', zoneController.create);
router.get('/:id', zoneController.getById);
router.put('/:id', zoneController.update);
router.delete('/:id', zoneController.delete);

module.exports = router;
