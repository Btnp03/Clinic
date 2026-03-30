import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAdvMB7jbA94n2BglmpGMM0PbXtVldPgss",
  authDomain: "my-app-33367.firebaseapp.com",
  projectId: "my-app-33367",
  storageBucket: "my-app-33367.firebasestorage.app",
  messagingSenderId: "580219971241",
  appId: "1:580219971241:web:4e8e8b353d319f74d5abb8"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = initializeFirestore(app, {});
