import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTjiXAkKldgy4TwqrWXRLgUzF-Tf20FLg",
  authDomain: "gomotar-7cd4a.firebaseapp.com",
  projectId: "gomotar-7cd4a",
  storageBucket: "gomotar-7cd4a.firebasestorage.app",
  messagingSenderId: "587440589803",
  appId: "1:587440589803:web:8c0d30db6b77d744eee7ae",
  measurementId: "G-TWLBC1SM8B"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup };
