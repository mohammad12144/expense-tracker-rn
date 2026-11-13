import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AuthSession, AuthUser, verifyToken } from '../services/mockAuth';
import { secureKv } from '../services/secureKv';
import { clearToken, restoreSession, saveToken } from '../services/session';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  signIn: (session: AuthSession, remember: boolean) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  // On app start: try to restore the saved session.
  useEffect(() => {
    let cancelled = false;
    restoreSession(secureKv, verifyToken).then((session) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
      setStatus(session ? 'signedIn' : 'signedOut');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback((session: AuthSession, remember: boolean) => {
    setUser(session.user);
    setStatus('signedIn');
    // Save the token only when the user chose "Remember me".
    const write = remember ? saveToken(secureKv, session.token) : clearToken(secureKv);
    write.catch(() => {});
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setStatus('signedOut');
    clearToken(secureKv).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ status, user, signIn, signOut }),
    [status, user, signIn, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}