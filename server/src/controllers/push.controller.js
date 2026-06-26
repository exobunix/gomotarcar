const pushService = require('../services/push.service');

const pushController = {
  sendToUser: async (req, res, next) => {
    try {
      const result = await pushService.sendToUser(req.params.userId, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  sendToRole: async (req, res, next) => {
    try {
      const result = await pushService.sendToRole(req.params.role, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  sendTest: async (req, res, next) => {
    try {
      const result = await pushService.sendTest(req.userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  updateToken: async (req, res, next) => {
    try {
      const { fcmToken, deviceId } = req.body;
      const result = await pushService.updateToken(req.userId, fcmToken, deviceId);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  removeToken: async (req, res, next) => {
    try {
      const result = await pushService.removeToken(req.userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  sendToTopic: async (req, res, next) => {
    try {
      const result = await pushService.sendToTopic(req.body.topic, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  subscribeToTopic: async (req, res, next) => {
    try {
      const result = await pushService.subscribeToTopic(req.body.fcmTokens, req.body.topic);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  unsubscribeFromTopic: async (req, res, next) => {
    try {
      const result = await pushService.unsubscribeFromTopic(req.body.fcmTokens, req.body.topic);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },
};

module.exports = pushController;
