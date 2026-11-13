import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import type { ExpensesRepo } from '../../store/expensesStore';
import { Expense } from '../../types/expense';
import { getFirebase } from './client';
import { fromExpenseDoc, toExpenseDoc } from './expenseDoc';

/** Data path: users/{uid}/rnExpenses/{expenseId}. Each user can only reach their own documents. */
export function createFirestoreRepo(uid: string): ExpensesRepo {
  const col = collection(getFirebase().db, 'users', uid, 'rnExpenses');

  return {
    subscribe(onData, onError) {
      return onSnapshot(
        query(col, orderBy('date', 'desc')),
        (snapshot) => {
          const list: Expense[] = [];
          for (const d of snapshot.docs) {
            const expense = fromExpenseDoc(d.id, d.data());
            if (expense) list.push(expense);
          }
          onData(list);
        },
        onError,
      );
    },
    add: (e) => setDoc(doc(col, e.id), toExpenseDoc(e)),
    update: (e) => setDoc(doc(col, e.id), toExpenseDoc(e)),
    remove: (id) => deleteDoc(doc(col, id)),
  };
}