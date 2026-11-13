import { ApiError } from './api/ApiError';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const TOKEN_PREFIX = 'mock.';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Fake "server" token: prefix + JSON {user, exp}. A real server would send a signed JWT
 * or an opaque random string. The client must treat the token as a secret either way.
 */
export function issueToken(user: AuthUser, now = Date.now(), ttlMs = TOKEN_TTL_MS): string {
  return TOKEN_PREFIX + encodeURIComponent(JSON.stringify({ user, exp: now + ttlMs }));
}

/** Returns the user for a valid, unexpired token, otherwise null. */
export function parseToken(token: string, now = Date.now()): AuthUser | null {
  if (!token.startsWith(TOKEN_PREFIX)) return null;
  try {
    const data: unknown = JSON.parse(decodeURIComponent(token.slice(TOKEN_PREFIX.length)));
    if (typeof data !== 'object' || data === null) return null;
    const { user, exp } = data as { user?: AuthUser; exp?: unknown };
    if (typeof exp !== 'number' || exp <= now) return null;
    if (!user || typeof user.id !== 'string' || typeof user.email !== 'string') return null;
    return user;
  } catch {
    return null;
  }
}

// Demo rules: password "wrong123" fails login, email "taken@example.com" fails register.
export async function login(email: string, password: string): Promise<AuthSession> {
  await delay(800);
  if (password === 'wrong123') throw new Error('Incorrect email or password');
  const user: AuthUser = { id: '1', name: email.split('@')[0], email };
  return { token: issueToken(user), user };
}

export async function register(
  name: string,
  email: string,
  _password: string,
): Promise<AuthSession> {
  await delay(900);
  if (email.toLowerCase() === 'taken@example.com') {
    throw new Error('This email is already registered');
  }
  const user: AuthUser = { id: String(Date.now()), name, email };
  return { token: issueToken(user), user };
}

/** Like GET /me: asks the "server" who this token belongs to. 401 when invalid or expired. */
export async function verifyToken(token: string): Promise<AuthUser> {
  await delay(500);
  const user = parseToken(token);
  if (!user) throw new ApiError('http', 401);
  return user;
}