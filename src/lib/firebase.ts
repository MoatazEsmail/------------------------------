import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvgQ_F81HMB14J-43qKf3K5EwJ5xkbnA8",
  authDomain: "studio-3207212798-513e5.firebaseapp.com",
  projectId: "studio-3207212798-513e5",
  storageBucket: "studio-3207212798-513e5.firebasestorage.app",
  messagingSenderId: "78066536169",
  appId: "1:78066536169:web:0f68374251873d77cf2a78"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
