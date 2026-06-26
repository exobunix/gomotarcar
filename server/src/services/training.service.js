const TrainingVideo = require('../models/TrainingVideo');
const TrainingProgress = require('../models/TrainingProgress');
const { AppError } = require('../middleware/errorHandler');

class TrainingService {
  async createVideo(data) {
    const video = await TrainingVideo.create(data);
    return video;
  }

  async getVideoById(videoId) {
    const video = await TrainingVideo.findById(videoId).populate('createdBy', 'firstName lastName');
    if (!video) throw new AppError('Training video not found', 404, 'TRAINING_NOT_FOUND');
    return video;
  }

  async listVideos({ page = 1, limit = 20, category, isActive, search } = {}) {
    const query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [videos, total] = await Promise.all([
      TrainingVideo.find(query).sort({ order: 1 }).skip(skip).limit(limit),
      TrainingVideo.countDocuments(query),
    ]);

    return {
      data: videos,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  async updateVideo(videoId, updates) {
    const video = await TrainingVideo.findByIdAndUpdate(videoId, updates, { new: true, runValidators: true });
    if (!video) throw new AppError('Training video not found', 404, 'TRAINING_NOT_FOUND');
    return video;
  }

  async deleteVideo(videoId) {
    const video = await TrainingVideo.findByIdAndDelete(videoId);
    if (!video) throw new AppError('Training video not found', 404, 'TRAINING_NOT_FOUND');
    await TrainingProgress.deleteMany({ videoId });
    return { message: 'Training video deleted' };
  }

  async trackProgress(cleanerId, videoId, data) {
    let progress = await TrainingProgress.findOne({ cleanerId, videoId });
    if (!progress) {
      progress = await TrainingProgress.create({ cleanerId, videoId, ...data });
    } else {
      Object.assign(progress, data);
      if (data.progress === 100) {
        progress.completed = true;
        progress.completedAt = new Date();
      }
      await progress.save();
    }
    return progress;
  }

  async getProgress(cleanerId) {
    return TrainingProgress.find({ cleanerId })
      .populate('videoId', 'title category duration')
      .sort({ createdAt: -1 });
  }

  async getStats() {
    const [totalVideos, totalActive, totalProgress] = await Promise.all([
      TrainingVideo.countDocuments(),
      TrainingVideo.countDocuments({ isActive: true }),
      TrainingProgress.countDocuments({ completed: true }),
    ]);

    const categoryStats = await TrainingVideo.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const avgCompletion = await TrainingProgress.aggregate([
      { $group: { _id: null, avgProgress: { $avg: '$progress' }, totalCompleted: { $sum: { $cond: ['$completed', 1, 0] } } } },
    ]);

    return {
      totalVideos,
      totalActive,
      totalCompleted: totalProgress,
      categoryBreakdown: categoryStats,
      averageProgress: avgCompletion[0]?.avgProgress || 0,
      totalEnrollments: avgCompletion[0]?.totalCompleted || 0,
    };
  }

  async getCleanerStats() {
    return TrainingProgress.aggregate([
      { $group: { _id: '$cleanerId', videosCompleted: { $sum: { $cond: ['$completed', 1, 0] } }, avgProgress: { $avg: '$progress' } } },
      { $sort: { videosCompleted: -1 } },
      { $limit: 10 },
    ]);
  }
}

module.exports = new TrainingService();
