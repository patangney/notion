// Import the functions you need from the SDKs you need
import { getApps, initializeApp, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkzHq-1qCOBEaK4-naaQNHwirrpLpU4E4",
  authDomain: "notion-clone-dbdfc.firebaseapp.com",
  projectId: "notion-clone-dbdfc",
  storageBucket: "notion-clone-dbdfc.firebasestorage.app",
  messagingSenderId: "724820829548",
  appId: "1:724820829548:web:fc767ccdcf7d6ebff0bf49",
  measurementId: "G-L0LZJR9C3T",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db, analytics };
