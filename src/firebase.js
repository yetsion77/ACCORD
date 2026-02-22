import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyB0aUyP6ctSwVYF8krHB0TuYkh14VVAeZU",
    authDomain: "accord-a9b7f.firebaseapp.com",
    databaseURL: "https://accord-a9b7f-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "accord-a9b7f",
    storageBucket: "accord-a9b7f.firebasestorage.app",
    messagingSenderId: "433337752471",
    appId: "1:433337752471:web:e2abc953655c74259b82d2",
    measurementId: "G-BKSJY6494W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const db = getDatabase(app);
