const mongoose = require('mongoose');
const zoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: String, state: String,
  boundary: { type: { type: String, enum: ['Polygon'] }, coordinates: [ [ [Number] ] ] },
  center: { type: { type: String, enum: ['Point'] }, coordinates: [Number] },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cleanerCount: { type: Number, default: 0 },
  activeCleaners: { type: Number, default: 0 },
  activeTasks: { type: Number, default: 0 },
  radius: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
zoneSchema.index({ 'boundary': '2dsphere' });
module.exports = mongoose.model('Zone', zoneSchema);
