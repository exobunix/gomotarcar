const settingsService = require('../services/settings.service');

const settingsController = {
  getPublicSettings: async (req, res, next) => {
    try {
      const general = await settingsService.getByGroup('general');
      // Only expose non-sensitive fields
      const publicFields = {
        appName: general.appName || 'GoMotarCar',
        logoUrl: general.logoUrl || '',
        supportEmail: general.supportEmail || '',
        supportPhone: general.supportPhone || '',
      };
      res.status(200).json({ success: true, data: publicFields });
    } catch (error) { next(error); }
  },

  getAll: async (req, res, next) => {
    try {
      const settings = await settingsService.getAll();
      res.status(200).json({ success: true, data: settings });
    } catch (error) { next(error); }
  },

  getByGroup: async (req, res, next) => {
    try {
      const settings = await settingsService.getByGroup(req.params.group);
      res.status(200).json({ success: true, data: settings });
    } catch (error) { next(error); }
  },

  updateGroup: async (req, res, next) => {
    try {
      const results = await settingsService.updateGroup(req.params.group, req.body, req.userId);
      res.status(200).json({ success: true, data: results });
    } catch (error) { next(error); }
  },

  update: async (req, res, next) => {
    try {
      const { group, key, value } = req.body;
      const setting = await settingsService.update(group, key, value, req.userId);
      res.status(200).json({ success: true, data: setting });
    } catch (error) { next(error); }
  },

  delete: async (req, res, next) => {
    try {
      const result = await settingsService.delete(req.params.group, req.params.key);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },
};

module.exports = settingsController;
