const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  ownerParamSchema, walletDeductSchema, walletCreditSchema,
  transferSchema, listTransactionsSchema, walletIdParamSchema,
} = require('../validators/wallet.validator');

router.use(authenticate);

// User wallet access
router.get('/:ownerType/:ownerId', validate(ownerParamSchema, 'params'), walletController.getBalance);
router.get('/:ownerType/:ownerId/details', validate(ownerParamSchema, 'params'), walletController.getWalletDetails);
router.get('/:ownerType/:ownerId/transactions', validate(ownerParamSchema, 'params'), validate(listTransactionsSchema, 'query'), walletController.getTransactions);

// Admin routes
router.get('/stats', authorize(roles.SUPER_ADMIN, roles.MANAGER), walletController.getStats);
router.post('/:id/deduct', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(walletIdParamSchema, 'params'), validate(walletDeductSchema), walletController.deduct);
router.post('/:id/credit', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(walletIdParamSchema, 'params'), validate(walletCreditSchema), walletController.credit);
router.post('/transfer', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(transferSchema), walletController.transfer);

module.exports = router;
