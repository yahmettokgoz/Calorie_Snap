// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD-b7YfReIp_CWm0RFLwhDDezgK01yHD_E",
  authDomain: "mobilcaloriesnap-a8174.firebaseapp.com",
  projectId: "mobilcaloriesnap-a8174",
  storageBucket: "mobilcaloriesnap-a8174.firebasestorage.app",
  messagingSenderId: "741887630026",
  appId: "1:741887630026:web:6b603bc9f33c7ee5123233",
  measurementId: "G-402LFX9T8D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Eklenen: Firebase Auth
export const auth = getAuth(app);

// (Opsiyonel) Analytics sadece web için geçerlidir
const analytics = getAnalytics(app);

export const db = getFirestore(app);
