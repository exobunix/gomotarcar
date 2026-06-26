const apartmentService = require('../services/apartment.service');

const apartmentController = {
  /**
   * POST /api/v1/apartments
   * Create a new apartment/address
   */
  create: async (req, res, next) => {
    try {
      const apartment = await apartmentService.create(req.body);
      res.status(201).json({ success: true, data: apartment });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/apartments
   * List all apartments (admin)
   */
  list: async (req, res, next) => {
    try {
      const result = await apartmentService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/apartments/:id
   * Get apartment by ID
   */
  getById: async (req, res, next) => {
    try {
      const apartment = await apartmentService.getById(req.params.id);
      res.status(200).json({ success: true, data: apartment });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/apartments/customer/:customerId
   * List apartments for a customer
   */
  listByCustomer: async (req, res, next) => {
    try {
      const result = await apartmentService.listByCustomer(
        req.params.customerId, req.query
      );
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/apartments/:id
   * Update apartment
   */
  update: async (req, res, next) => {
    try {
      const apartment = await apartmentService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: apartment });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/apartments/:id/default
   * Set apartment as default
   */
  setDefault: async (req, res, next) => {
    try {
      const apartment = await apartmentService.setDefault(req.params.id);
      res.status(200).json({ success: true, data: apartment });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/apartments/:id
   * Delete apartment
   */
  delete: async (req, res, next) => {
    try {
      const result = await apartmentService.delete(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = apartmentController;
