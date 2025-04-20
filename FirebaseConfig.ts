// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0A-izJxhyFgYI_LfV_PSi0yJGr34y6_Q",
  authDomain: "attendance-application-47aa5.firebaseapp.com",
  projectId: "attendance-application-47aa5",
  storageBucket: "attendance-application-47aa5.firebasestorage.app",
  messagingSenderId: "576416747204",
  appId: "1:576416747204:web:490167135e018290534391"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
