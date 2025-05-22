// Import the functions you need from the SDKs you need
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVTe0GFYJTqNWk43rjDIGV-0T6CPmE8dA",
  authDomain: "group-mind.firebaseapp.com",
  projectId: "group-mind",
  storageBucket: "group-mind.firebasestorage.app",
  messagingSenderId: "132683689333",
  appId: "1:132683689333:web:869db8d46e0f3cfed2373c",
  measurementId: "G-DQL2S9MZT5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
})

const db = getFirestore(app);
export {auth, db}
