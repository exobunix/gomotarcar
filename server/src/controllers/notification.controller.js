const notificationService = require('../services/notification.service');

const notificationController = {
  send: async (req, res, next) => {
    try {
      const notification = await notificationService.send(req.body);
      res.status(201).json({ success: true, data: notification });
    } catch (error) { next(error); }
  },

  sendBulk: async (req, res, next) => {
    try {
      const result = await notificationService.sendBulk(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  list: async (req, res, next) => {
    try {
      const result = await notificationService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  listForUser: async (req, res, next) => {
    try {
      const result = await notificationService.listForUser(req.params.userId, req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  getUnreadCount: async (req, res, next) => {
    try {
      const count = await notificationService.getUnreadCount(req.params.userId);
      res.status(200).json({ success: true, data: { count } });
    } catch (error) { next(error); }
  },

  markAsRead: async (req, res, next) => {
    try {
      const notification = await notificationService.markAsRead(req.params.id);
      res.status(200).json({ success: true, data: notification });
    } catch (error) { next(error); }
  },

  markAllAsRead: async (req, res, next) => {
    try {
      const result = await notificationService.markAllAsRead(req.params.userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  delete: async (req, res, next) => {
    try {
      const result = await notificationService.delete(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await notificationService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },
};

module.exports = notificationController;
