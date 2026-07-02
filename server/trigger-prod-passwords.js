const axios = require('axios');

async function fixPasswordsInProduction() {
  try {
    const res = await axios.post('https://gomotarcar-api.onrender.com/api/v1/supervisor/fix-passwords');
    console.log('Success:', res.data);
  } catch (err) {
    if (err.response) {
      console.log('Error status:', err.response.status);
      console.log('Error data:', err.response.data);
    } else {
      console.log('Error:', err.message);
    }
  }
}

// Keep trying every 30 seconds until it succeeds (Render might still be deploying)
let attempts = 0;
const interval = setInterval(async () => {
  attempts++;
  console.log(`\nAttempt ${attempts}...`);
  try {
    const res = await axios.post('https://gomotarcar-api.onrender.com/api/v1/supervisor/fix-passwords');
    console.log('Success!', res.data);
    clearInterval(interval);
  } catch (err) {
    if (err.response && err.response.status !== 404 && err.response.status !== 401 && err.response.status !== 403) {
        console.log('Deployed but failed with:', err.response.status);
    } else {
        console.log('Waiting for deploy... (Status:', err.response ? err.response.status : err.message, ')');
    }
    
    if (attempts >= 10) {
      console.log('Timed out waiting for deploy.');
      clearInterval(interval);
    }
  }
}, 30000);

// trigger immediately once
fixPasswordsInProduction();
