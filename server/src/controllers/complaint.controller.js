const complaintService = require('../services/complaint.service');

const complaintController = {
  create: async (req, res, next) => {
    try {
      const complaint = await complaintService.create(req.body);
      res.status(201).json({ success: true, data: complaint });
    } catch (error) { next(error); }
  },

  list: async (req, res, next) => {
    try {
      const result = await complaintService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  getById: async (req, res, next) => {
    try {
      const complaint = await complaintService.getById(req.params.id);
      res.status(200).json({ success: true, data: complaint });
    } catch (error) { next(error); }
  },

  getByTicket: async (req, res, next) => {
    try {
      const complaint = await complaintService.getByTicketNumber(req.params.ticketNumber);
      res.status(200).json({ success: true, data: complaint });
    } catch (error) { next(error); }
  },

  assign: async (req, res, next) => {
    try {
      const complaint = await complaintService.assign(req.params.id, req.body.userId);
      res.status(200).json({ success: true, data: complaint });
    } catch (error) { next(error); }
  },

  resolve: async (req, res, next) => {
    try {
      const complaint = await complaintService.resolve(req.params.id, { ...req.body, resolvedBy: req.userId });
      res.status(200).json({ success: true, data: complaint });
    } catch (error) { next(error); }
  },

  close: async (req, res, next) => {
    try {
      const complaint = await complaintService.close(req.params.id, req.body);
      res.status(200).json({ success: true, data: complaint });
    } catch (error) { next(error); }
  },

  updatePriority: async (req, res, next) => {
    try {
      const { priority } = req.body;
      const complaint = await complaintService.updatePriority(req.params.id, priority);
      res.status(200).json({ success: true, data: complaint });
    } catch (error) { next(error); }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await complaintService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },
};

module.exports = complaintController;
