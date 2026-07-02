const axios = require('axios');

const API_BASE = 'https://gomotarcar-api.onrender.com/api/v1';

// Admin credentials
const ADMIN_EMAIL = 'superadmin@gomotarcar.com';
const ADMIN_PASSWORD = 'Admin@123456';

// Supervisor details to create/update
const TARGET_PHONE = '9999999999'; // 10 digits
const TARGET_PASSWORD = 'TestPassword123';

async function run() {
  console.log('🚀 Authenticating as Admin on Render...');
  let adminToken = '';
  
  try {
    const adminLoginRes = await axios.post(`${API_BASE}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    adminToken = adminLoginRes.data?.data?.tokens?.accessToken;
  } catch (err) {
    console.error('Admin login failed, trying auth/login alternate...');
    try {
      const authLoginRes = await axios.post(`${API_BASE}/auth/login`, {
        phone: '+919000000000',
        password: ADMIN_PASSWORD
      });
      adminToken = authLoginRes.data?.data?.tokens?.accessToken;
    } catch (err2) {
      console.error('❌ Both admin auth methods failed:', err2.response?.data || err2.message);
      process.exit(1);
    }
  }

  console.log('✅ Admin authenticated successfully!');

  // Check if supervisor already exists
  console.log('\n🔍 Checking if supervisor exists...');
  const dumpRes = await axios.get(`${API_BASE}/supervisor/dump-supervisors`);
  const supervisors = dumpRes.data?.data || [];
  const targetSupervisor = supervisors.find(s => s.phone === `+91${TARGET_PHONE}`);

  if (targetSupervisor) {
    console.log(`Supervisor found (ID: ${targetSupervisor.id}, UserID: ${targetSupervisor.userId}).`);
    
    // 1. Reset password
    console.log('🔄 Resetting password...');
    try {
      const resetRes = await axios.post(
        `${API_BASE}/supervisor/reset-password/${encodeURIComponent('+91' + TARGET_PHONE)}`,
        { newPassword: TARGET_PASSWORD },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.log('Password reset response:', resetRes.data);
    } catch (err) {
      console.error('Password reset failed:', err.response?.data || err.message);
    }

    // 2. Approve/Verify supervisor
    console.log('🔓 Verifying/Approving supervisor...');
    try {
      const verifyRes = await axios.patch(
        `${API_BASE}/supervisor/${targetSupervisor.id}/verify`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.log('Verification response:', verifyRes.data);
    } catch (err) {
      console.error('Verification failed:', err.response?.data || err.message);
    }

  } else {
    console.log('Supervisor not found. Registering first...');
    // Register
    try {
      const regRes = await axios.post(`${API_BASE}/supervisor/register`, {
        firstName: 'Test',
        lastName: 'Supervisor',
        phone: TARGET_PHONE,
        password: TARGET_PASSWORD,
        email: 'testsup@gomotarcar.com'
      });
      console.log('Registration response:', regRes.data);
      
      // Fetch dump again to get ID
      const dumpRes2 = await axios.get(`${API_BASE}/supervisor/dump-supervisors`);
      const newSup = (dumpRes2.data?.data || []).find(s => s.phone === `+91${TARGET_PHONE}`);
      
      if (newSup) {
        console.log(`🔓 Verifying/Approving new supervisor (ID: ${newSup.id})...`);
        const verifyRes = await axios.patch(
          `${API_BASE}/supervisor/${newSup.id}/verify`,
          {},
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log('Verification response:', verifyRes.data);
      }
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message);
    }
  }

  console.log('\n✅ Script complete. Testing login as supervisor...');
  try {
    const testLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      phone: `+91${TARGET_PHONE}`,
      password: TARGET_PASSWORD
    });
    console.log('🎉 Login successful! Response:', testLoginRes.data);
  } catch (err) {
    console.error('❌ Supervisor login test failed:', err.response?.data || err.message);
  }
}

run();
