import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import legacyConfig from '../firebase-applet-config.json';

// Firebase configuration using environment variables to avoid exposing secrets in source code.
// These are managed via the AI Studio Secrets/Settings panel.
const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DB_ID,
};

// Priority: Env Vars > Legacy Config File
const isConfigValid = (config: any) => config && config.apiKey && config.apiKey !== 'PLACEHOLDER_API_KEY';

let finalConfig = envConfig;
if (!isConfigValid(envConfig)) {
  if (isConfigValid(legacyConfig)) {
    finalConfig = legacyConfig;
  } else {
    console.warn("⚠️ Firebase configuration missing! Please add VITE_FIREBASE_* secrets in AI Studio Settings.");
    // Use a dummy config to prevent immediate crash, though features won't work
    finalConfig = { ...envConfig, apiKey: 'MISSING', projectId: 'MISSING' };
  }
}

const app = initializeApp(finalConfig);
export const db = getFirestore(app, finalConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// Validation test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'startup'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Firebase: Client appears to be offline or config is invalid.");
    }
  }
}
testConnection();
