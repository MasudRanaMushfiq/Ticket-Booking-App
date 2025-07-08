import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFWctpwuHz2uiT6foAmld2Wi6uvq_N22s",
  authDomain: "ticketfinal-80f30.firebaseapp.com",
  projectId: "ticketfinal-80f30",
  storageBucket: "ticketfinal-80f30.appspot.com",  // fix your storageBucket URL here, note it's usually ".appspot.com"
  messagingSenderId: "334749653241",
  appId: "1:334749653241:web:bbe2d3b32de1cc0ac92a28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
