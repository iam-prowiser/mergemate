import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log("Firebase config check:", {
  apiKey: firebaseConfig.apiKey ? "PRESENT" : "MISSING",
  authDomain: firebaseConfig.authDomain ? "PRESENT" : "MISSING",
  projectId: firebaseConfig.projectId ? "PRESENT" : "MISSING",
  appId: firebaseConfig.appId ? "PRESENT" : "MISSING",
});

export const app = initializeApp(firebaseConfig);