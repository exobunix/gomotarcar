const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const campaignController = require('../controllers/campaign.controller');

router.get('/', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), campaignController.getCampaigns);
router.get('/:id', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), campaignController.getCampaignById);
router.post('/', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER), campaignController.createCampaign);
router.put('/:id', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER), campaignController.updateCampaign);
router.delete('/:id', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER), campaignController.deleteCampaign);
router.post('/:id/send', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER), campaignController.sendCampaign);
router.post('/:id/cancel', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER), campaignController.cancelCampaign);
router.get('/stats/overview', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), campaignController.getCampaignStats);

module.exports = router;
