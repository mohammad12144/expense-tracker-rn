export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface FirebaseUserLike {
  uid: string;
  displayName: string | null;
  email: string | null;
}

export function toAuthUser(user: FirebaseUserLike): AuthUser {
  const email = user.email ?? '';
  const name = user.displayName?.trim() || email.split('@')[0] || 'User';
  return { id: user.uid, name, email };
}

/** Friendly text for Firebase Auth error codes. */
export function authErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null ? (error as { code?: unknown }).code : undefined;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Incorrect email or password';
    case 'auth/invalid-email':
      return 'Enter a valid email';
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/weak-password':
      return 'Password is too weak (use at least 6 characters)';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later';
    case 'auth/network-request-failed':
      return 'Cannot reach the server. Check your internet connection';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in Firebase';
    default:
      return 'Something went wrong. Please try again';
  }
}