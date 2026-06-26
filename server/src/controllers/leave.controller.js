const leaveService = require('../services/leave.service');

const leaveController = {
  apply: async (req, res, next) => {
    try {
      const leave = await leaveService.apply(req.body);
      res.status(201).json({ success: true, data: leave });
    } catch (error) { next(error); }
  },

  list: async (req, res, next) => {
    try {
      const result = await leaveService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  getById: async (req, res, next) => {
    try {
      const leave = await leaveService.getById(req.params.id);
      res.status(200).json({ success: true, data: leave });
    } catch (error) { next(error); }
  },

  approve: async (req, res, next) => {
    try {
      const leave = await leaveService.approve(req.params.id, { approvedBy: req.userId });
      res.status(200).json({ success: true, data: leave });
    } catch (error) { next(error); }
  },

  reject: async (req, res, next) => {
    try {
      const { reason } = req.body;
      const leave = await leaveService.reject(req.params.id, { approvedBy: req.userId, rejectionReason: reason });
      res.status(200).json({ success: true, data: leave });
    } catch (error) { next(error); }
  },

  getBalance: async (req, res, next) => {
    try {
      const balance = await leaveService.getBalance(req.params.cleanerId);
      res.status(200).json({ success: true, data: balance });
    } catch (error) { next(error); }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await leaveService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },
};

module.exports = leaveController;
