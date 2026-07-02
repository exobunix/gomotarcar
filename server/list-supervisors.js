const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://gomotarcar:gomotarcar123@cluster0.mongodb.net/gomotarcar?retryWrites=true&w=majority';

async function listSupervisors() {
  await mongoose.connect(MONGO_URI);
  const User = mongoose.model('User', new mongoose.Schema({
    phone: String,
    role: String,
    passwordHash: { type: String, select: false },
    isActive: Boolean,
  }, { strict: false }));

  const supervisors = await User.find({ role: 'supervisor' }).select('+passwordHash');
  console.log(`Found ${supervisors.length} supervisors:`);
  supervisors.forEach(s => {
    console.log(`- ID: ${s._id}, Phone: '${s.phone}', Active: ${s.isActive}, HasPassword: ${!!s.passwordHash}`);
  });
  await mongoose.disconnect();
}

listSupervisors().catch(console.error);
