const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/training.controller');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');

router.use(authenticate);

// Stats routes (specific routes BEFORE parameterized routes)
router.get('/stats', authorize(roles.SUPER_ADMIN, roles.MANAGER), trainingController.getStats);
router.get('/cleaner-stats', authorize(roles.SUPER_ADMIN, roles.MANAGER), trainingController.getCleanerStats);

// Progress routes (specific routes BEFORE parameterized routes to avoid Express matching conflicts)
router.post('/:cleanerId/progress/:videoId', trainingController.trackProgress);
router.get('/:cleanerId/progress', trainingController.getProgress);

// CRUD routes
router.get('/', trainingController.listVideos);
router.post('/', authorize(roles.SUPER_ADMIN, roles.MANAGER), trainingController.createVideo);
router.get('/:id', trainingController.getVideoById);
router.put('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER), trainingController.updateVideo);
router.delete('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER), trainingController.deleteVideo);

module.exports = router;
