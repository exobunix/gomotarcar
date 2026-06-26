const Razorpay = require('razorpay');
const config = require('./env');

let razorpayInstance = null;

const initializeRazorpay = () => {
  if (razorpayInstance) return razorpayInstance;

  if (!config.razorpayKeyId || !config.razorpayKeySecret) {
    console.warn('Razorpay credentials not configured');
    return null;
  }

  razorpayInstance = new Razorpay({
    key_id: config.razorpayKeyId,
    key_secret: config.razorpayKeySecret,
  });

  console.log('Razorpay initialized');
  return razorpayInstance;
};

const getRazorpay = () => razorpayInstance;

module.exports = { initializeRazorpay, getRazorpay };
