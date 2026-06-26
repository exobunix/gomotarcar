const admin = require('firebase-admin');
const config = require('./env');

let firebaseApp = null;

const initializeFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    if (config.firebasePrivateKey) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebaseProjectId,
          privateKey: config.firebasePrivateKey.replace(/\n/g, '\n'),
          clientEmail: config.firebaseClientEmail,
        }),
      });
    } else {
      firebaseApp = admin.initializeApp();
    }

    console.log('Firebase initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('Firebase initialization failed:', error.message);
    return null;
  }
};

const getMessaging = () => {
  if (!firebaseApp) return null;
  return admin.messaging();
};

module.exports = { initializeFirebase, getMessaging, admin };
