const nodemailer = require('nodemailer');
const config = require('./env');

let transporter = null;

const initializeEmail = () => {
  if (transporter) return transporter;

  if (!config.smtpHost) {
    console.warn('SMTP not configured — email disabled');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });

  console.log('Email service initialized');
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.warn('Email not sent — service not initialized');
    return null;
  }
  return transporter.sendMail({
    from: config.emailFrom,
    to,
    subject,
    html,
  });
};

module.exports = { initializeEmail, sendEmail };
