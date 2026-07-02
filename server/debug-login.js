/**
 * Deep diagnostic: check supervisor login + password state
 */
const axios = require('axios');

const API_BASE = 'https://gomotarcar-api.onrender.com/api/v1';

// First login as admin to get token
async function adminLogin() {
  const res = await axios.post(`${API_BASE}/admin/login`, {
    email: 'superadmin@gomotarcar.com',
    password: 'Admin@123456'
  }, { validateStatus: () => true });
  
  if (res.status === 200) return res.data?.data?.tokens?.accessToken;
  
  // try alternate
  const res2 = await axios.post(`${API_BASE}/auth/login`, {
    phone: '+919000000000',
    password: 'Admin@123456'
  }, { validateStatus: () => true });
  
  return res2.data?.data?.tokens?.accessToken;
}

async function testLogin(phone, password) {
  console.log('\n========================================');
  console.log('SUPERVISOR LOGIN DIAGNOSTIC');
  console.log(`Phone: ${phone}`);
  console.log(`Password: ${password}`);
  console.log('========================================\n');

  const res = await axios.post(`${API_BASE}/auth/login`, { phone, password }, {
    timeout: 30000,
    validateStatus: () => true,
  });

  console.log(`HTTP Status: ${res.status}`);
  console.log('Response:', JSON.stringify(res.data, null, 2));

  if (res.status === 200) {
    console.log('\n✅ LOGIN SUCCESS! Role:', res.data?.data?.user?.role);
  } else if (res.status === 429) {
    console.log('\n🚫 RATE LIMITED - Too many attempts. Wait 15 minutes.');
  } else if (res.data?.error?.code === 'AUTH_PASSWORD_NOT_SET') {
    console.log('\n⚠️  NO PASSWORD SET in database for this user!');
    console.log('   You need to set a password via the admin panel Edit button.');
  } else if (res.data?.error?.code === 'AUTH_INVALID_CREDENTIALS') {
    console.log('\n❌ PASSWORD MISMATCH - User exists but password does not match hash.');
    console.log('   The password in DB was likely saved incorrectly (double-hashed or plain text).');
    console.log('   Solution: Edit the supervisor in admin panel and set a NEW password.');
  } else {
    console.log('\n❓ Unknown error');
  }
}

const [,, phone, password] = process.argv;
if (!phone || !password) {
  console.log('Usage: node debug-login.js "+91XXXXXXXXXX" "yourPassword"');
  process.exit(1);
}
testLogin(phone, password);
