import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Warning: To run properly, replace these mock env defaults safely injected via Vite
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_MOCK_DONT_USE_IN_PROD",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bodilicious-d38a3.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bodilicious-d38a3",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bodilicious-d38a3.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
