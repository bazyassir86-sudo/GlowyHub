import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCVD_PE41DkVNV6kiyo4inAEB22pRcH7UI",
  authDomain: "glowyhub-c728c.firebaseapp.com",
  projectId: "glowyhub-c728c",
  messagingSenderId: "764747002510",
  appId: "1:764747002510:web:ce28d46773e041e76e4fdf",
  measurementId: "G-EX70K8B2Z2"
};

export const isFirebaseConfigured = true;

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
