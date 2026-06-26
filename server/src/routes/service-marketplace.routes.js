const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/service-marketplace.controller');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');

router.use(authenticate);

// Stats
router.get('/stats', authorize(roles.SUPER_ADMIN, roles.MANAGER), marketplaceController.getStats);

// Categories
router.get('/categories', marketplaceController.listCategories);
router.post('/categories', authorize(roles.SUPER_ADMIN, roles.MANAGER), marketplaceController.createCategory);
router.put('/categories/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER), marketplaceController.updateCategory);
router.delete('/categories/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER), marketplaceController.deleteCategory);

// Providers
router.get('/providers', marketplaceController.listProviders);
router.post('/providers', authorize(roles.SUPER_ADMIN, roles.MANAGER), marketplaceController.createProvider);
router.put('/providers/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER), marketplaceController.updateProvider);
router.delete('/providers/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER), marketplaceController.deleteProvider);

module.exports = router;
