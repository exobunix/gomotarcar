require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://gomotarcar:gomotarcar123@cluster0.mongodb.net/gomotarcar?retryWrites=true&w=majority';

async function resetAllPasswords() {
  console.log('\n=== Supervisor Mass Password Reset Tool ===');

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const User = mongoose.model('User', new mongoose.Schema({
    phone: String,
    role: String,
    passwordHash: { type: String, select: false },
    isActive: Boolean,
  }, { strict: false }));

  const Supervisor = mongoose.model('Supervisor', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    firstName: String,
    lastName: String,
  }, { strict: false }));

  const supervisors = await Supervisor.find().populate('userId');
  
  if (supervisors.length === 0) {
    console.log('No supervisors found.');
  }

  for (const sup of supervisors) {
    const user = sup.userId;
    console.log(`Checking supervisor: ${sup.firstName}, User object present: ${!!user}`);
    if (!user || user.role !== 'supervisor') {
      console.log(`Skipping because role is ${user ? user.role : 'missing'}`);
      continue;
    }

    const firstName = sup.firstName || 'Supervisor';
    const newPassword = `${firstName}@123`;
    
    const hash = await bcrypt.hash(newPassword, 12);
    await User.collection.updateOne(
      { _id: user._id },
      { $set: { passwordHash: hash, updatedAt: new Date() } }
    );
    console.log(`✅ Updated password for ${firstName} (Phone: ${user.phone}) to: ${newPassword}`);
  }

  await mongoose.disconnect();
}

resetAllPasswords().catch(console.error);
