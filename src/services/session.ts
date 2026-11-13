import { isApiError } from './api/ApiError';
import { AuthSession, AuthUser } from './mockAuth';

/** The tiny storage interface the app needs (SecureStore on phones, localStorage on web). */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const TOKEN_KEY = 'auth_token';

export function saveToken(store: KeyValueStore, token: string): Promise<void> {
  return store.setItem(TOKEN_KEY, token);
}

export function clearToken(store: KeyValueStore): Promise<void> {
  return store.removeItem(TOKEN_KEY);
}

/**
 * Called once at app start. Reads the saved token and asks the server who it belongs to.
 * - no token: signed out
 * - server says 401 (invalid or expired): delete the token, signed out
 * - any other problem (storage or network): signed out, but keep the token for next time
 */
export async function restoreSession(
  store: KeyValueStore,
  verify: (token: string) => Promise<AuthUser>,
): Promise<AuthSession | null> {
  try {
    const token = await store.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      return { token, user: await verify(token) };
    } catch (e) {
      if (isApiError(e) && e.kind === 'http' && e.status === 401) {
        await clearToken(store);
      }
      return null;
    }
  } catch {
    return null;
  }
}