import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Main App Configuration
const mainFirebaseConfig = {
  apiKey: "AIzaSyB1RstKg1rmjTe31Zwnam88xgF1ad0IF6A",
  authDomain: "codevogue-5656c.firebaseapp.com",
  projectId: "codevogue-5656c",
  storageBucket: "codevogue-5656c.firebasestorage.app",
  messagingSenderId: "723313357441",
  appId: "1:723313357441:web:9847416461c35cda421380",
};

// HunterOS Configuration
const hunterOsFirebaseConfig = {
  apiKey: "AIzaSyBJTlZ97bRoAaAzt81aoIaHgnfzs3MwLj0",
  authDomain: "hunteros-e7685.firebaseapp.com",
  projectId: "hunteros-e7685",
  storageBucket: "hunteros-e7685.firebasestorage.app",
  messagingSenderId: "1037268923772",
  appId: "1:1037268923772:web:0cdd6e4b27427219d360f9",
  measurementId: "G-2MTG578P4W"
};

// Prevent duplicate init in browser refresh/hot reload cases
const mainApp = getApps().some(app => app.name === "[DEFAULT]")
  ? getApp()
  : initializeApp(mainFirebaseConfig);

const hunterOsApp = getApps().some(app => app.name === "HunterOS")
  ? getApp("HunterOS")
  : initializeApp(hunterOsFirebaseConfig, "HunterOS");

// Main CodeVogue exports
export const auth = getAuth(mainApp);
export const db = getFirestore(mainApp);

// HunterOS exports
export const hunterOsAuth = getAuth(hunterOsApp);
export const hunterOsDb = getFirestore(hunterOsApp);

export { mainApp, hunterOsApp };