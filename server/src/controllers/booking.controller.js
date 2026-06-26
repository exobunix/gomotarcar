const bookingService = require('../services/booking.service');

const bookingController = {
  create: async (req, res, next) => {
    try {
      const booking = await bookingService.create(req.body);
      res.status(201).json({ success: true, data: booking });
    } catch (error) { next(error); }
  },

  list: async (req, res, next) => {
    try {
      const result = await bookingService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  getById: async (req, res, next) => {
    try {
      const booking = await bookingService.getById(req.params.id);
      res.status(200).json({ success: true, data: booking });
    } catch (error) { next(error); }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { status, note } = req.body;
      const booking = await bookingService.updateStatus(req.params.id, status, note);
      res.status(200).json({ success: true, data: booking });
    } catch (error) { next(error); }
  },

  addExtraCharge: async (req, res, next) => {
    try {
      const booking = await bookingService.addExtraCharge(req.params.id, req.body);
      res.status(200).json({ success: true, data: booking });
    } catch (error) { next(error); }
  },

  approveExtraCharge: async (req, res, next) => {
    try {
      const booking = await bookingService.approveExtraCharge(req.params.id, req.params.chargeId);
      res.status(200).json({ success: true, data: booking });
    } catch (error) { next(error); }
  },

  generateJobCard: async (req, res, next) => {
    try {
      const booking = await bookingService.generateJobCard(req.params.id);
      res.status(200).json({ success: true, data: booking });
    } catch (error) { next(error); }
  },

  cancel: async (req, res, next) => {
    try {
      const { reason } = req.body;
      const booking = await bookingService.cancel(req.params.id, reason);
      res.status(200).json({ success: true, data: booking });
    } catch (error) { next(error); }
  },

  addReview: async (req, res, next) => {
    try {
      const booking = await bookingService.addReview(req.params.id, req.body);
      res.status(200).json({ success: true, data: booking });
    } catch (error) { next(error); }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await bookingService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },
};

module.exports = bookingController;
