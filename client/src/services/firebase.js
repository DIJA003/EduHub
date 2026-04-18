import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDenZE4qP5-zPsKrDZ0E9F-DIfIZHAqXBE",
  authDomain: "eduhub-26.firebaseapp.com",
  projectId: "eduhub-26",
  storageBucket: "eduhub-26.firebasestorage.app",
  messagingSenderId: "549025372948",
  appId: "1:549025372948:web:37dd5599b37690f1b90001",
  measurementId: "G-8T5XQCM75G",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
