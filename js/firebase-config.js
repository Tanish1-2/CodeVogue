import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Main App Configuration (Replace with your keys)
const mainFirebaseConfig = {
apiKey: "AIzaSyB1RstKg1rmjTe31Zwnam88xgF1ad0IF6A",
authDomain: "codevogue-5656c.firebaseapp.com",
projectId: "codevogue-5656c",
storageBucket: "codevogue-5656c.firebasestorage.app",
messagingSenderId: "723313357441",
appId: "1:723313357441:web:9847416461c35cda421380",
};

// HunterOS Configuration (Replace with your keys)
const hunterOsFirebaseConfig = {
  apiKey: "AIzaSyBJTlZ97bRoAaAzt81aoIaHgnfzs3MwLj0",
  authDomain: "hunteros-e7685.firebaseapp.com",
  projectId: "hunteros-e7685",
  storageBucket: "hunteros-e7685.firebasestorage.app",
  messagingSenderId: "1037268923772",
  appId: "1:1037268923772:web:0cdd6e4b27427219d360f9",
  measurementId: "G-2MTG578P4W"
};

// Initialize Main App (Default)
const mainApp = initializeApp(mainFirebaseConfig);

// Initialize HunterOS App (Named app)
const hunterOsApp = initializeApp(hunterOsFirebaseConfig, "HunterOS");

// Export both auth instances
export const mainAuth = getAuth(mainApp);
export const hunterOsAuth = getAuth(hunterOsApp);