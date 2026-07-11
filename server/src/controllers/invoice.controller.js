const invoiceService = require('../services/invoice.service');

const invoiceController = {
  /**
   * POST /api/v1/invoices/generate/:bookingId
   * Generate invoice for a completed booking
   */
  generate: async (req, res, next) => {
    try {
      const booking = await invoiceService.generate(req.params.bookingId);
      res.status(201).json({ success: true, data: { invoice: booking.invoice, bookingId: booking.bookingId } });
    } catch (error) { next(error); }
  },

  /**
   * GET /api/v1/invoices/booking/:bookingId
   * Get invoice by booking ID
   */
  getByBookingId: async (req, res, next) => {
    try {
      const invoice = await invoiceService.getByBookingId(req.params.bookingId);
      res.status(200).json({ success: true, data: invoice });
    } catch (error) { next(error); }
  },

  /**
   * GET /api/v1/invoices
   * List all invoices
   */
  list: async (req, res, next) => {
    try {
      if (req.user && req.user.role === 'franchise') {
        const Franchise = require('../models/Franchise');
        const franchise = await Franchise.findOne({ userId: req.user.id });
        if (franchise) {
          req.query.franchiseId = franchise._id.toString();
        } else {
          req.query.franchiseId = '000000000000000000000000';
        }
      }
      const result = await invoiceService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },
};

module.exports = invoiceController;
