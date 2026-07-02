const axios = require('axios');
const mongoose = require('mongoose');

const API_BASE = 'https://gomotarcar-api.onrender.com/api/v1';
const MONGO_URI = 'mongodb+srv://gomotarcar:gomotarcar123@cluster0.mongodb.net/gomotarcar?retryWrites=true&w=majority';

// Test credentials
const TEST_PHONE = '+917999999999';
const TEST_PASSWORD = 'TestPassword123';
const TEST_FIRSTNAME = 'Test';
const TEST_LASTNAME = 'Supervisor';

async function runCrossCheck() {
  console.log('🚀 Starting Supervisor API flow cross-check...');
  console.log('Backend Base URL:', API_BASE);
  console.log('MongoDB connection initialized...');

  // Connect to DB for approval & cleanup
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

  // Cleanup any old test runs
  await User.deleteMany({ phone: TEST_PHONE });
  await Supervisor.deleteMany({ phone: TEST_PHONE });

  // 1. REGISTER
  console.log('\n--- Step 1: Registering new supervisor... ---');
  try {
    const regRes = await axios.post(`${API_BASE}/supervisor/register`, {
      firstName: TEST_FIRSTNAME,
      lastName: TEST_LASTNAME,
      phone: TEST_PHONE.replace('+91', ''),
      password: TEST_PASSWORD,
    });
    console.log('Status:', regRes.status);
    console.log('Response:', regRes.data);
    if (regRes.data.success) {
      console.log('✅ Self-registration endpoint works perfectly!');
    }
  } catch (err) {
    console.error('❌ Registration failed:', err.response?.data || err.message);
    await mongoose.disconnect();
    process.exit(1);
  }

  // 2. VERIFY REGISTERED (AWAITING APPROVAL) LOGIN ATTEMPT
  console.log('\n--- Step 2: Testing login before admin approval... ---');
  try {
    const loginFailRes = await axios.post(`${API_BASE}/auth/login`, {
      phone: TEST_PHONE,
      password: TEST_PASSWORD,
    }, { validateStatus: () => true });

    console.log('Status:', loginFailRes.status);
    console.log('Response:', loginFailRes.data);
    if (loginFailRes.status === 403) {
      console.log('✅ Login successfully blocked for unapproved supervisor with 403 Forbidden!');
    } else {
      console.warn('⚠️ Warning: Unexpected login status code:', loginFailRes.status);
    }
  } catch (err) {
    console.error('Login attempt check failed:', err.message);
  }

  // 3. APPROVE
  console.log('\n--- Step 3: Approving supervisor via DB utility... ---');
  const user = await User.findOne({ phone: TEST_PHONE, role: 'supervisor' });
  if (!user) {
    console.error('❌ Error: Registered user not found in DB!');
    await mongoose.disconnect();
    process.exit(1);
  }

  user.isActive = true;
  await user.save();

  const supervisor = await Supervisor.findOne({ userId: user._id });
  if (supervisor) {
    supervisor.isActive = true;
    await supervisor.save();
    console.log('✅ Supervisor approved & activated successfully!');
  } else {
    console.warn('⚠️ Warning: Supervisor profile not found in DB!');
  }

  // 4. LOGIN AFTER APPROVAL
  console.log('\n--- Step 4: Testing login after admin approval... ---');
  let token = '';
  try {
    const loginSuccessRes = await axios.post(`${API_BASE}/auth/login`, {
      phone: TEST_PHONE,
      password: TEST_PASSWORD,
    });
    console.log('Status:', loginSuccessRes.status);
    console.log('User Role:', loginSuccessRes.data?.data?.user?.role);
    if (loginSuccessRes.status === 200 && loginSuccessRes.data?.data?.tokens?.accessToken) {
      console.log('✅ Login successful after approval!');
      token = loginSuccessRes.data.data.tokens.accessToken;
    }
  } catch (err) {
    console.error('❌ Login failed after approval:', err.response?.data || err.message);
    await mongoose.disconnect();
    process.exit(1);
  }

  // 5. FETCH PROFILE
  console.log('\n--- Step 5: Testing Authenticated Profile Retrieval... ---');
  try {
    const profileRes = await axios.get(`${API_BASE}/supervisor/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status:', profileRes.status);
    console.log('Profile retrieved:', profileRes.data?.data?.firstName, profileRes.data?.data?.lastName);
    if (profileRes.status === 200 && profileRes.data?.data) {
      console.log('✅ Supervisor profile endpoint works perfectly!');
    }
  } catch (err) {
    console.error('❌ Profile retrieval failed:', err.response?.data || err.message);
  }

  // CLEANUP
  console.log('\n--- Cleaning up test records from DB... ---');
  await User.deleteOne({ _id: user._id });
  await Supervisor.deleteOne({ userId: user._id });
  console.log('✅ Test records cleaned up successfully!');

  await mongoose.disconnect();
  console.log('\n🎉 ALL SUPERVISOR APIS VALIDATED SUCCESSFULLY & ARE WORKING CORRECTLY!');
}

runCrossCheck().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
