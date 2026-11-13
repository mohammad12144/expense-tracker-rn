export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

export type FirebaseEnv = Partial<Record<keyof FirebaseConfig, string | undefined>>;

/** Returns the config, or null when a required value is missing or empty. */
export function readFirebaseConfig(env: FirebaseEnv): FirebaseConfig | null {
  const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);
  const apiKey = clean(env.apiKey);
  const authDomain = clean(env.authDomain);
  const projectId = clean(env.projectId);
  const appId = clean(env.appId);
  if (!apiKey || !authDomain || !projectId || !appId) return null;
  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    storageBucket: clean(env.storageBucket),
    messagingSenderId: clean(env.messagingSenderId),
  };
}

// Expo only inlines EXPO_PUBLIC_* variables when they are written out like this.
export const firebaseConfig = readFirebaseConfig({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
});

export const isFirebaseConfigured = firebaseConfig !== null;