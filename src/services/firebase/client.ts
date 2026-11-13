import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { Auth, getAuth, initializeAuth, Persistence } from 'firebase/auth';
import { Firestore, getFirestore, initializeFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import { firebaseConfig } from './config';

interface Firebase {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

// The React Native build of firebase/auth exports this, but its TypeScript types do not.
type ReactNativePersistenceFactory = (storage: {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}) => Persistence;

function createAuth(app: FirebaseApp): Auth {
  if (Platform.OS === 'web') return getAuth(app);
  const factory = (FirebaseAuth as unknown as { getReactNativePersistence?: ReactNativePersistenceFactory })
    .getReactNativePersistence;
  if (!factory) return getAuth(app);
  try {
    // Keeps the user signed in between app launches.
    return initializeAuth(app, { persistence: factory(AsyncStorage) });
  } catch {
    // Already initialized (Fast Refresh).
    return getAuth(app);
  }
}

function createFirestore(app: FirebaseApp): Firestore {
  try {
    // Long polling auto-detection avoids WebSocket problems on some networks and on React Native.
    return initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  } catch {
    return getFirestore(app);
  }
}

let instance: Firebase | null = null;

/** Creates Firebase on first use. Call only when isFirebaseConfigured is true. */
export function getFirebase(): Firebase {
  if (instance) return instance;
  if (!firebaseConfig) {
    throw new Error('Firebase is not configured. Add the EXPO_PUBLIC_FIREBASE_* values to .env');
  }
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  instance = { app, auth: createAuth(app), db: createFirestore(app) };
  return instance;
}