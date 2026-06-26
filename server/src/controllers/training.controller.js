const trainingService = require('../services/training.service');

const trainingController = {
  createVideo: async (req, res, next) => {
    try {
      const video = await trainingService.createVideo(req.body);
      res.status(201).json({ success: true, data: video });
    } catch (error) { next(error); }
  },

  listVideos: async (req, res, next) => {
    try {
      const result = await trainingService.listVideos(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  getVideoById: async (req, res, next) => {
    try {
      const video = await trainingService.getVideoById(req.params.id);
      res.status(200).json({ success: true, data: video });
    } catch (error) { next(error); }
  },

  updateVideo: async (req, res, next) => {
    try {
      const video = await trainingService.updateVideo(req.params.id, req.body);
      res.status(200).json({ success: true, data: video });
    } catch (error) { next(error); }
  },

  deleteVideo: async (req, res, next) => {
    try {
      const result = await trainingService.deleteVideo(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  trackProgress: async (req, res, next) => {
    try {
      const progress = await trainingService.trackProgress(req.params.cleanerId, req.params.videoId, req.body);
      res.status(200).json({ success: true, data: progress });
    } catch (error) { next(error); }
  },

  getProgress: async (req, res, next) => {
    try {
      const progress = await trainingService.getProgress(req.params.cleanerId);
      res.status(200).json({ success: true, data: progress });
    } catch (error) { next(error); }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await trainingService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },

  getCleanerStats: async (req, res, next) => {
    try {
      const stats = await trainingService.getCleanerStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },
};

module.exports = trainingController;
