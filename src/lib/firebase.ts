import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCY_KumUJK8h82uEIQb134T-HRllTdtK4U",
  authDomain: "gen-lang-client-0765204672.firebaseapp.com",
  projectId: "gen-lang-client-0765204672",
  storageBucket: "gen-lang-client-0765204672.firebasestorage.app",
  messagingSenderId: "307063450454",
  appId: "1:307063450454:web:3dba19c15938e9c293c4f7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);