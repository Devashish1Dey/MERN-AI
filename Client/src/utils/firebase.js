import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "shifraai-6bbb8.firebaseapp.com",
  projectId: "shifraai-6bbb8",
  storageBucket: "shifraai-6bbb8.firebasestorage.app",
  messagingSenderId: "173834078172",
  appId: "1:173834078172:web:ecb0833e835142d3ed3119"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export {auth, provider}