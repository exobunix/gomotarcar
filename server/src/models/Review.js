const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
  referenceType: { type: String, enum: ['task','service_booking','provider','cleaner'], required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  reviewedEntityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String, photos: [String],
  categories: { punctuality: Number, quality: Number, professionalism: Number, communication: Number, valueForMoney: Number },
  isPublic: { type: Boolean, default: true },
  responded: { type: Boolean, default: false },
  response: String, respondedAt: Date, respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
reviewSchema.index({ reviewedEntityId: 1, createdAt: -1 });
reviewSchema.index({ referenceId: 1 });
module.exports = mongoose.model('Review', reviewSchema);
