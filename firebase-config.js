// Firebase Konfiguration - Verwendet FIREBASE_API Secret
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API,
    authDomain: "aboutme-49bfb.firebaseapp.com",
    projectId: "aboutme-49bfb",
    storageBucket: "aboutme-49bfb.firebasestorage.app",
    messagingSenderId: "135756692299",
    appId: "1:135756692299:web:1999c654468d4300f706ce"
};

// Firebase initialisieren
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot, increment } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Globale Variablen für Firebase
window.db = db;
window.firestore = { doc, getDoc, setDoc, updateDoc, onSnapshot, increment };
