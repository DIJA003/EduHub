import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY            || "AIzaSyDenZE4qP5-zPsKrDZ0E9F-DIfIZHAqXBE",
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN        || "eduhub-26.firebaseapp.com",
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID         || "eduhub-26",
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET     || "eduhub-26.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "549025372948",
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID             || "1:549025372948:web:37dd5599b37690f1b90001",
  measurementId:     process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID     || "G-8T5XQCM75G",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});