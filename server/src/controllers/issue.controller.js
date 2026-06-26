const issueService = require('../services/issue.service');

const issueController = {
  create: async (req, res, next) => {
    try {
      const issue = await issueService.create(req.body, req.userId);
      res.status(201).json({ success: true, data: issue });
    } catch (error) { next(error); }
  },

  list: async (req, res, next) => {
    try {
      const result = await issueService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  getById: async (req, res, next) => {
    try {
      const issue = await issueService.getById(req.params.id);
      res.status(200).json({ success: true, data: issue });
    } catch (error) { next(error); }
  },

  update: async (req, res, next) => {
    try {
      const issue = await issueService.update(req.params.id, req.body, req.userId);
      res.status(200).json({ success: true, data: issue });
    } catch (error) { next(error); }
  },

  delete: async (req, res, next) => {
    try {
      const result = await issueService.delete(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await issueService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },
};

module.exports = issueController;
