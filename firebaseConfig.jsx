// Import required Firebase modules
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔥 Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFWctpwuHz2uiT6foAmld2Wi6uvq_N22s",
  authDomain: "ticketfinal-80f30.firebaseapp.com",
  projectId: "ticketfinal-80f30",
  storageBucket: "ticketfinal-80f30.appspot.com", // ✅ Corrected: must end with .appspot.com
  messagingSenderId: "334749653241",
  appId: "1:334749653241:web:bbe2d3b32de1cc0ac92a28",
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth with persistent login (auto-login)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Export all Firebase services
export { app, auth, db, storage };
