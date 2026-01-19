// firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDZss8iuTCy5WSWTvuXzEGhWupPGSDzPAI",
  authDomain: "mahanagar-dd38d.firebaseapp.com",
  projectId: "mahanagar-dd38d",
  storageBucket: "mahanagar-dd38d.firebasestorage.app",
  messagingSenderId: "358939402997",
  appId: "1:358939402997:web:001217ca371607f04a5bbc",
};

// only initialize once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export default app;
