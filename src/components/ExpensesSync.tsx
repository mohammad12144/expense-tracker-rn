import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createFirestoreRepo } from '../services/firebase/expensesRepo';
import { useExpenseStore } from '../store/expensesStore';

/** Renders nothing. While a user is signed in, keeps the expenses store in sync with Firestore. */
export function ExpensesSync() {
  const { user } = useAuth();
  const connect = useExpenseStore((s) => s.connect);
  const disconnect = useExpenseStore((s) => s.disconnect);
  const uid = user?.id;

  useEffect(() => {
    if (!uid) return;
    connect(createFirestoreRepo(uid));
    return disconnect;
  }, [uid, connect, disconnect]);

  return null;
}