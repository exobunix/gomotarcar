const walletService = require('../services/wallet.service');

const walletController = {
  getBalance: async (req, res, next) => {
    try {
      const balance = await walletService.getBalance(req.params.ownerType, req.params.ownerId);
      res.status(200).json({ success: true, data: balance });
    } catch (error) { next(error); }
  },

  getWalletDetails: async (req, res, next) => {
    try {
      const details = await walletService.getWalletDetails(req.params.ownerType, req.params.ownerId);
      res.status(200).json({ success: true, data: details });
    } catch (error) { next(error); }
  },

  getTransactions: async (req, res, next) => {
    try {
      const wallet = await walletService.getOrCreateWallet(req.params.ownerType, req.params.ownerId);
      const result = await walletService.getTransactions(wallet._id, req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  deduct: async (req, res, next) => {
    try {
      const result = await walletService.deduct(req.params.id, req.body.amount, {
        ...req.body, performedBy: req.userId,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  credit: async (req, res, next) => {
    try {
      const result = await walletService.credit(req.params.id, req.body.amount, {
        ...req.body, performedBy: req.userId,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  transfer: async (req, res, next) => {
    try {
      const { fromWalletId, toWalletId, amount, description } = req.body;
      const result = await walletService.transfer(fromWalletId, toWalletId, amount, {
        description, performedBy: req.userId,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await walletService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },
};

module.exports = walletController;
