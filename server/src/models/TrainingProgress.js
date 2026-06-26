const mongoose = require('mongoose');
const progressSchema = new mongoose.Schema({
  cleanerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cleaner', required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingVideo', required: true },
  progress: { type: Number, default: 0 }, watchedDuration: { type: Number, default: 0 },
  completed: { type: Boolean, default: false }, completedAt: Date,
  quizAttempted: { type: Boolean, default: false },
  quizScore: Number, quizPassed: { type: Boolean, default: false }, quizAttempts: { type: Number, default: 0 },
}, { timestamps: true });
progressSchema.index({ cleanerId: 1, videoId: 1 }, { unique: true });
module.exports = mongoose.model('TrainingProgress', progressSchema);
