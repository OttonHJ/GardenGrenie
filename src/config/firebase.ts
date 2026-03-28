import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA2CPL_9efvIw034gLatt6KbcCK9et4S8c",
  authDomain: "gardengrenie.firebaseapp.com",
  projectId: "gardengrenie",
  storageBucket: "gardengrenie.firebasestorage.app",
  messagingSenderId: "990735411747",
  appId: "1:990735411747:web:5a682e9bfb115196e01f96",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
