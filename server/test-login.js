const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('https://gomotarcar-api.onrender.com/api/v1/auth/login', {
      phone: '+919710000000',
      password: 'wrongpassword'
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('Error response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();
