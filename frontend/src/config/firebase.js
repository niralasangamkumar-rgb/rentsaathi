import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAcyLT0-Dm45KM9wLTd0DuDH56WUasRQn8",
  authDomain: "rentsaathi-18509.firebaseapp.com",
  projectId: "rentsaathi-18509",
  storageBucket: "rentsaathi-18509.firebasestorage.app",
  messagingSenderId: "526374588002",
  appId: "1:526374588002:web:12e4572c7399a7a17d0b3b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

// Helper to initialize invisible reCAPTCHA only once
export function setupRecaptcha() {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible',
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      },
      auth
    );
  }
  return window.recaptchaVerifier;
}
