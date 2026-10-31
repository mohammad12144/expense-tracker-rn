import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { AuthUser } from '../services/mockAuth';

interface AuthState {
  user: AuthUser | null;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const signIn = useCallback((u: AuthUser) => setUser(u), []);
  const signOut = useCallback(() => setUser(null), []);

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}