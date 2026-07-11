const offerService = require('../services/offer.service');

const offerController = {
  list: async (req, res, next) => {
    try {
      const result = await offerService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  create: async (req, res, next) => {
    try {
      const data = { ...req.body, createdBy: req.user.id };
      const offer = await offerService.create(data);
      res.status(201).json({ success: true, data: offer });
    } catch (error) { next(error); }
  },

  update: async (req, res, next) => {
    try {
      const offer = await offerService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: offer });
    } catch (error) { next(error); }
  },

  delete: async (req, res, next) => {
    try {
      const result = await offerService.delete(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },
};

module.exports = offerController;
