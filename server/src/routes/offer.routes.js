const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offer.controller');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');

router.use(authenticate);

router.get('/', offerController.list);
router.post('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.FRANCHISE), offerController.create);
router.put('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.FRANCHISE), offerController.update);
router.delete('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.FRANCHISE), offerController.delete);

module.exports = router;
