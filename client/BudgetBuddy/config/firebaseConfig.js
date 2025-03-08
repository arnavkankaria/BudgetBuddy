import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { FirebaseApiKey, AuthDomain, ProjectID, StorageBucket, SenderID, AppID } from "@env"; // Import from .env

const firebaseConfig = {
  apiKey: FirebaseApiKey,
  authDomain: AuthDomain,
  projectId: ProjectID,
  storageBucket: StorageBucket,
  messagingSenderId: SenderID,
  appId: AppID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);  
export const db = getFirestore(app);

export default app;
