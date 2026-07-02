const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://gomotarcar:gomotarcar123@cluster0.mongodb.net/gomotarcar?retryWrites=true&w=majority';

async function fixPhonesAndPasswords() {
  await mongoose.connect(MONGO_URI);
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  
  const users = await User.find({ role: 'supervisor' }).select('+passwordHash phone');
  console.log(`Found ${users.length} supervisors to fix.`);
  
  for (const user of users) {
    let phone = user.phone;
    let needsUpdate = false;
    
    // Fix phone format to always be +91 followed by 10 digits
    if (phone && !phone.startsWith('+91')) {
      const rawDigits = phone.replace(/[^0-9]/g, '').slice(-10);
      phone = `+91${rawDigits}`;
      needsUpdate = true;
    }
    
    // Always set password to Adarsh@123 just for testing, wait no, let's look at the name
    const Supervisor = mongoose.model('Supervisor', new mongoose.Schema({}, { strict: false }));
    const sup = await Supervisor.findOne({ userId: user._id });
    
    let fn = sup && sup.firstName ? sup.firstName.replace(/\s+/g, '') : 'Supervisor';
    const newPassword = `${fn}@123`;
    const hash = await bcrypt.hash(newPassword, 12);
    
    await User.collection.updateOne(
      { _id: user._id },
      { $set: { phone: phone, passwordHash: hash, updatedAt: new Date() } }
    );
    console.log(`Updated ${fn}: phone=${phone}, pass=${newPassword}`);
  }
  
  await mongoose.disconnect();
}

fixPhonesAndPasswords().catch(console.error);
