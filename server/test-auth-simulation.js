require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://gomotarcar:gomotarcar123@cluster0.mongodb.net/gomotarcar?retryWrites=true&w=majority';

async function testAuth() {
  await mongoose.connect(MONGO_URI);
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  
  const allUsers = await User.find({ role: 'supervisor' }).select('+passwordHash');
  console.log(`\nFound ${allUsers.length} supervisors in DB.`);
  
  for (const u of allUsers) {
    console.log(`\n---------------------------------`);
    console.log(`Testing DB User ID: ${u._id}`);
    console.log(`Phone in DB: "${u.phone}"`);
    console.log(`Password Hash in DB: "${u.passwordHash}"`);
    console.log(`Role: ${u.role}`);
    
    // Simulate what the app sends. The app strips non-digits and appends +91
    const rawInput = u.phone.replace(/[^0-9]/g, '').slice(-10); // get last 10 digits
    const appSends = `+91${rawInput}`;
    console.log(`\nIf user types exactly 10 digits: "${rawInput}"`);
    console.log(`The app will send phone: "${appSends}"`);
    
    // Test the exact mongoose query auth.service uses
    const queryResult = await User.findOne({ phone: appSends }).select('+passwordHash');
    if (!queryResult) {
      console.log(`❌ ERROR: User.findOne({ phone: '${appSends}' }) returned NULL!`);
      console.log(`   This is why login fails. The DB has "${u.phone}" but app sends "${appSends}".`);
    } else {
      console.log(`✅ User.findOne({ phone: '${appSends}' }) SUCCESS!`);
      
      // Let's test the password
      // In my reset script, I used firstName@123
      const Supervisor = mongoose.model('Supervisor', new mongoose.Schema({}, { strict: false }));
      const sup = await Supervisor.findOne({ userId: queryResult._id });
      const passwordToType = `${sup.firstName}@123`;
      
      console.log(`\nIf user types password: "${passwordToType}"`);
      if (!queryResult.passwordHash) {
         console.log(`❌ ERROR: No passwordHash set!`);
      } else {
         const isMatch = await bcrypt.compare(passwordToType, queryResult.passwordHash);
         console.log(isMatch ? `✅ Password match SUCCESS!` : `❌ Password match FAILED!`);
      }
    }
  }

  await mongoose.disconnect();
}

testAuth().catch(console.error);
