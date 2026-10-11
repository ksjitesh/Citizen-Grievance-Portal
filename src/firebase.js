import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDdrO05qRxdPvPogyzSr0wKcVrt5Iluxe8",
  authDomain: "civicai-portal.firebaseapp.com",
  projectId: "civicai-portal",
  storageBucket: "civicai-portal.firebasestorage.app",
  messagingSenderId: "132269728718",
  appId: "1:132269728718:web:d46f6270f7cb753ecfc19f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
