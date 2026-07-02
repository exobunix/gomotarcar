/**
 * Debug script: test supervisor login against live production API
 * Run: node test-supervisor-login.js <phone> <password>
 */
const axios = require('axios');

const API_BASE = 'https://gomotarcar-api.onrender.com/api/v1';

async function testLogin(phone, password) {
  console.log('\n========================================');
  console.log(`Testing login for phone: ${phone}`);
  console.log(`Password entered: ${password}`);
  console.log('========================================\n');

  // Step 1: Check if user exists
  console.log('Step 1: Checking if user exists in DB via login attempt...');
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, { phone, password }, {
      timeout: 20000,
      validateStatus: () => true, // don't throw on non-2xx
    });

    console.log('Response status:', res.status);
    console.log('Response data:', JSON.stringify(res.data, null, 2));

    if (res.status === 200) {
      console.log('\n✅ LOGIN SUCCESSFUL!');
      console.log('User role:', res.data?.data?.user?.role);
    } else if (res.data?.code === 'AUTH_INVALID_CREDENTIALS') {
      console.log('\n❌ Invalid credentials - phone or password mismatch');
      console.log('   This could mean:');
      console.log('   1. Phone number not found in DB');
      console.log('   2. Password hash mismatch (plain text vs bcrypt)');
    } else if (res.data?.code === 'AUTH_PASSWORD_NOT_SET') {
      console.log('\n⚠️  User found but NO password is set in the database!');
      console.log('   The password was never saved properly.');
    } else {
      console.log('\n⚠️  Other error:', res.data?.message);
    }
  } catch (err) {
    console.error('Network error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.log('Server is not running or not reachable');
    }
  }
}

// Get args from command line
const [,, phone, password] = process.argv;
if (!phone || !password) {
  console.log('Usage: node test-supervisor-login.js <phone> <password>');
  console.log('Example: node test-supervisor-login.js +919967853364 myPassword123');
  process.exit(1);
}

testLogin(phone, password);
