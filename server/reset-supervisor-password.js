/**
 * Direct password reset script - bypasses all app layers
 * Run: node reset-supervisor-password.js "+91XXXXXXXXXX" "newPassword123"
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://gomotarcar:gomotarcar123@cluster0.mongodb.net/gomotarcar?retryWrites=true&w=majority';

async function resetPassword(phone, newPassword) {
  console.log('\n=== Supervisor Password Reset Tool ===');
  console.log(`Phone: ${phone}`);
  console.log(`New password: ${newPassword}`);

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const User = mongoose.model('User', new mongoose.Schema({
    phone: String,
    role: String,
    passwordHash: { type: String, select: false },
    isActive: Boolean,
  }, { strict: false }));

  const user = await User.findOne({ phone }).select('+passwordHash');

  if (!user) {
    console.log(`❌ No user found with phone: ${phone}`);
    await mongoose.disconnect();
    return;
  }

  console.log(`\nFound user: ${user._id}`);
  console.log(`Role: ${user.role}`);
  console.log(`Active: ${user.isActive}`);
  console.log(`Has existing password: ${!!user.passwordHash}`);

  if (user.role !== 'supervisor') {
    console.log(`\n⚠️  WARNING: This user is a "${user.role}", not a supervisor!`);
    console.log('The supervisor app will reject this login even with correct credentials.');
  }

  // Hash the password properly
  const hash = await bcrypt.hash(newPassword, 12);
  await User.collection.updateOne(
    { _id: user._id },
    { $set: { passwordHash: hash, updatedAt: new Date() } }
  );

  console.log(`\n✅ Password updated successfully for ${phone}`);
  console.log(`   Use phone: ${phone}`);
  console.log(`   Use password: ${newPassword}`);

  // Verify it works
  const verifyUser = await User.findOne({ phone }).select('+passwordHash');
  const isMatch = await bcrypt.compare(newPassword, verifyUser.passwordHash);
  console.log(`\n🔍 Verification check: ${isMatch ? '✅ PASS - Password will work!' : '❌ FAIL - Something went wrong'}`);

  await mongoose.disconnect();
}

const [,, phone, password] = process.argv;
if (!phone || !password) {
  console.log('Usage: node reset-supervisor-password.js "+91XXXXXXXXXX" "newPassword123"');
  console.log('Example: node reset-supervisor-password.js "+919967853364" "Super@123"');
  process.exit(1);
}
resetPassword(phone, password).catch(console.error);
