import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  Firestore 
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let db: Firestore | null = null;
let auth: Auth | null = null;

export const isFirebaseConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

if (isFirebaseConfigured) {
  try {
    let app;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
    } else {
      app = getApp();
      db = getFirestore(app);
    }
    auth = getAuth(app);
  } catch (error) {
    console.warn('Cấu hình Firebase chưa đầy đủ, chuyển sang chế độ Mock Storage.', error);
  }
}

export { db, auth };


