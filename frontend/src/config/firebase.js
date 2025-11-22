import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAZYcG9p79agqkddwIkewS9-G_bWpmSJg0",
    authDomain: "coverbots-b9f79.firebaseapp.com",
    projectId: "coverbots-b9f79",
    storageBucket: "coverbots-b9f79.firebasestorage.app",
    messagingSenderId: "725977784724",
    appId: "1:725977784724:web:dbd6c9e6ad22cb4ef9af81",
    measurementId: "G-6GWDBPVZGT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, db, storage };
