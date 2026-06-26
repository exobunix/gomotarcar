const Zone = require('../models/Zone');
const { AppError } = require('../middleware/errorHandler');

const zoneController = {
  create: async (req, res, next) => {
    try {
      const zone = await Zone.create(req.body);
      res.status(201).json({ success: true, data: zone });
    } catch (error) { next(error); }
  },

  list: async (req, res, next) => {
    try {
      const { page = 1, limit = 20, search, city, isActive } = req.query;
      const query = {};
      if (search) query.name = { $regex: search, $options: 'i' };
      if (city) query.city = { $regex: city, $options: 'i' };
      if (isActive !== undefined) query.isActive = isActive === 'true';

      const skip = (page - 1) * limit;
      const [zones, total] = await Promise.all([
        Zone.find(query)
          .populate('supervisorId', 'firstName lastName phone')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Zone.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        data: zones,
        pagination: {
          page: parseInt(page), limit: parseInt(limit), total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) { next(error); }
  },

  getById: async (req, res, next) => {
    try {
      const zone = await Zone.findById(req.params.id).populate('supervisorId', 'firstName lastName phone');
      if (!zone) throw new AppError('Zone not found', 404, 'ZONE_NOT_FOUND');
      res.status(200).json({ success: true, data: zone });
    } catch (error) { next(error); }
  },

  update: async (req, res, next) => {
    try {
      const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!zone) throw new AppError('Zone not found', 404, 'ZONE_NOT_FOUND');
      res.status(200).json({ success: true, data: zone });
    } catch (error) { next(error); }
  },

  delete: async (req, res, next) => {
    try {
      const zone = await Zone.findByIdAndDelete(req.params.id);
      if (!zone) throw new AppError('Zone not found', 404, 'ZONE_NOT_FOUND');
      res.status(200).json({ success: true, data: { message: 'Zone deleted successfully' } });
    } catch (error) { next(error); }
  },

  getStats: async (req, res, next) => {
    try {
      const [total, active] = await Promise.all([
        Zone.countDocuments(),
        Zone.countDocuments({ isActive: true }),
      ]);
      res.status(200).json({ success: true, data: { totalZones: total, activeZones: active } });
    } catch (error) { next(error); }
  },
};

module.exports = zoneController;
