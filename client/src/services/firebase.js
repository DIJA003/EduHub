// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDenZE4qP5-zPsKrDZ0E9F-DIfIZHAqXBE",
  authDomain: "eduhub-26.firebaseapp.com",
  projectId: "eduhub-26",
  storageBucket: "eduhub-26.firebasestorage.app",
  messagingSenderId: "549025372948",
  appId: "1:549025372948:web:37dd5599b37690f1b90001",
  measurementId: "G-8T5XQCM75G"
};
const app = initializeApp(firebaseConfig);
// Initialize Firebase
export const auth = getAuth(app);
export const analytics = getAnalytics(app);