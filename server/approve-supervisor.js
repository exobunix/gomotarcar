const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://gomotarcar:gomotarcar123@cluster0.mongodb.net/gomotarcar?retryWrites=true&w=majority';

async function approveSupervisor() {
  const phone = process.argv[2];
  if (!phone) {
    console.error('Please specify a phone number to approve, e.g.: node approve-supervisor.js +919876543210');
    process.exit(1);
  }

  // Format phone number to start with +91 if not present
  let formattedPhone = phone.trim();
  if (!formattedPhone.startsWith('+91')) {
    formattedPhone = `+91${formattedPhone.replace(/[^0-9]/g, '').slice(-10)}`;
  }

  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(MONGO_URI);

  const User = mongoose.model('User', new mongoose.Schema({
    phone: String,
    role: String,
    isActive: Boolean,
  }, { strict: false }));

  const Supervisor = mongoose.model('Supervisor', new mongoose.Schema({
    phone: String,
    isActive: Boolean,
    userId: mongoose.Schema.Types.ObjectId,
  }, { strict: false }));

  const user = await User.findOne({ phone: formattedPhone, role: 'supervisor' });
  if (!user) {
    console.error(`Error: No supervisor found with phone number ${formattedPhone}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`Found supervisor user: ${user._id}`);
  user.isActive = true;
  await user.save();
  console.log(`User collection updated: isActive = true`);

  const supervisor = await Supervisor.findOne({ userId: user._id });
  if (supervisor) {
    supervisor.isActive = true;
    await supervisor.save();
    console.log(`Supervisor collection updated: isActive = true`);
  } else {
    console.warn(`Warning: No profile found in Supervisor collection for this user ID.`);
  }

  console.log(`🎉 Supervisor with phone ${formattedPhone} has been approved and activated!`);
  await mongoose.disconnect();
}

approveSupervisor().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
