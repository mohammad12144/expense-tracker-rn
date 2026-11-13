import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AuthUser } from '../services/firebase/authMapping';
import {
  onAuthChanged,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from '../services/firebase/authService';
import { isFirebaseConfigured } from '../services/firebase/config';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  /** false when the EXPO_PUBLIC_FIREBASE_* values are missing */
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(isFirebaseConfigured ? 'loading' : 'signedOut');
  const [user, setUser] = useState<AuthUser | null>(null);

  // Firebase tells us who is signed in: at app start (restored session), after login, after logout.
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onAuthChanged((u) => {
      setUser(u);
      setStatus(u ? 'signedIn' : 'signedOut');
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured) throw new Error('Firebase is not configured yet');
    await signInWithEmail(email, password);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (!isFirebaseConfigured) throw new Error('Firebase is not configured yet');
    const created = await signUpWithEmail(name, email, password);
    // The display name was set after Firebase announced the new user, so refresh it here.
    setUser(created);
    setStatus('signedIn');
  }, []);

  const signOut = useCallback(async () => {
    if (isFirebaseConfigured) await signOutUser();
  }, []);

  const value = useMemo(
    () => ({ status, user, configured: isFirebaseConfigured, signIn, signUp, signOut }),
    [status, user, signIn, signUp, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}