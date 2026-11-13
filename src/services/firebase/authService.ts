import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  Unsubscribe,
} from 'firebase/auth';
import { AuthUser, authErrorMessage, toAuthUser } from './authMapping';
import { getFirebase } from './client';

/** All functions throw an Error whose message is safe to show to the user. */
export async function signInWithEmail(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(getFirebase().auth, email, password);
  } catch (e) {
    throw new Error(authErrorMessage(e));
  }
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  try {
    const { user } = await createUserWithEmailAndPassword(getFirebase().auth, email, password);
    await updateProfile(user, { displayName: name });
    return toAuthUser({ uid: user.uid, displayName: name, email: user.email });
  } catch (e) {
    throw new Error(authErrorMessage(e));
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(getFirebase().auth);
}

export function onAuthChanged(callback: (user: AuthUser | null) => void): Unsubscribe {
  return onAuthStateChanged(getFirebase().auth, (u) => callback(u ? toAuthUser(u) : null));
}