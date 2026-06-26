const mongoose = require('mongoose');

const cleanerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true },
  photo: { type: String },
  cleanerId: { type: String, unique: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  alternatePhone: { type: String },
  email: { type: String, trim: true },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number],
    },
  },
  assignedZone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
  assignedArea: { type: String },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  joiningDate: { type: Date },
  experience: { type: Number },
  employmentType: { type: String, enum: ['full-time', 'part-time', 'contract'] },
  bankDetails: {
    accountHolder: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    upiId: String,
    paymentPreference: { type: String, enum: ['bank', 'upi'] },
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  documents: [{
    type: { type: String, enum: ['aadhaar', 'pan', 'driving_license', 'police_verification'] },
    documentNumber: String,
    fileUrl: String,
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    rejectionReason: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  language: { type: String, default: 'en' },
  notificationsEnabled: { type: Boolean, default: true },
  locationTrackingEnabled: { type: Boolean, default: true },
  stats: {
    totalTasksCompleted: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    attendancePercentage: { type: Number, default: 0 },
    currentMonthTasks: { type: Number, default: 0 },
    currentMonthEarnings: { type: Number, default: 0 },
    currentRating: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
  },
}, { timestamps: true });

cleanerSchema.index({ cleanerId: 1 });
cleanerSchema.index({ supervisorId: 1 });
cleanerSchema.index({ assignedZone: 1 });
cleanerSchema.index({ 'address.coordinates': '2dsphere' });
cleanerSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('Cleaner', cleanerSchema);
