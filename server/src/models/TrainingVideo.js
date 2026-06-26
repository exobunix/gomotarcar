const mongoose = require('mongoose');
const trainingVideoSchema = new mongoose.Schema({
  title: String, description: String,
  category: { type: String, enum: ['exterior_cleaning','interior_cleaning','customer_handling','safety_training','advanced'] },
  videoUrl: String, thumbnailUrl: String, duration: Number,
  isMandatory: { type: Boolean, default: false }, order: Number,
  hasQuiz: { type: Boolean, default: false }, passingScore: { type: Number, default: 70 },
  questions: [{ question: String, options: [String], correctAnswer: Number }],
  points: { type: Number, default: 0 }, isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
module.exports = mongoose.model('TrainingVideo', trainingVideoSchema);
