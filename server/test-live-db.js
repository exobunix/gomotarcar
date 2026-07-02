const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://gomotarcar:gomotarcar123@cluster0.mongodb.net/gomotarcar?retryWrites=true&w=majority';

async function testConnection() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB Atlas!');
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const count = await User.countDocuments();
    console.log(`Total users in production DB: ${count}`);
    await mongoose.disconnect();
  } catch(e) {
    console.log('Connection failed:', e.message);
  }
}

testConnection();
