import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyB1RstKg1rmjTe31Zwnam88xgF1ad0IF6A",
authDomain: "codevogue-5656c.firebaseapp.com",
projectId: "codevogue-5656c",
storageBucket: "codevogue-5656c.firebasestorage.app",
messagingSenderId: "723313357441",
appId: "1:723313357441:web:9847416461c35cda421380",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);