// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVTe0GFYJTqNWk43rjDIGV-0T6CPmE8dA",
  authDomain: "group-mind.firebaseapp.com",
  projectId: "group-mind",
  storageBucket: "group-mind.firebasestorage.app",
  messagingSenderId: "132683689333",
  databaseURL: "https://group-mind-default-rtdb.firebaseio.com",
  appId: "1:132683689333:web:869db8d46e0f3cfed2373c",
  measurementId: "G-DQL2S9MZT5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

// Initialize Realtime Database
const database = getDatabase(app);

export { auth, database, db };
