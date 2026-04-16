// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQSsuV9MTT_MaXj2yn1WTB3otINrsjYWQ",
  authDomain: "quiz-app-fd2fe.firebaseapp.com",
  projectId: "quiz-app-fd2fe",
  storageBucket: "quiz-app-fd2fe.firebasestorage.app",
  messagingSenderId: "973285410072",
  appId: "1:973285410072:web:87a90416be467c8cc6ca6d",
  measurementId: "G-DZ9D11ZT00"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);