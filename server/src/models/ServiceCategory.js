const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
  name: String, slug: { type: String, unique: true },
  icon: String, image: String, description: String,
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory', default: null },
  sortOrder: Number, isPopular: { type: Boolean, default: false }, isActive: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('ServiceCategory', categorySchema);
