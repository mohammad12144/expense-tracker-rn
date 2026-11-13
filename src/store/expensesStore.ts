import { create } from 'zustand';
import { CATEGORIES, Expense } from '../types/expense';

export type NewExpense = Omit<Expense, 'id'>;

/** Where the expenses are stored remotely (Firestore). The store does not know about Firebase. */
export interface ExpensesRepo {
  /** Calls onData with the full list now and after every change. Returns an unsubscribe function. */
  subscribe: (onData: (expenses: Expense[]) => void, onError: (error: Error) => void) => () => void;
  add: (expense: Expense) => Promise<void>;
  update: (expense: Expense) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export type SyncStatus = 'local' | 'loading' | 'synced' | 'error';

interface ExpensesState {
  expenses: Expense[];
  syncStatus: SyncStatus;
  syncError: string | null;
  add: (values: NewExpense) => Expense;
  update: (id: string, values: NewExpense) => void;
  remove: (id: string) => void;
  connect: (repo: ExpensesRepo) => void;
  disconnect: () => void;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// [title, amount, days ago]
const SEED: [string, number, number][] = [
  ['Coffee', 3.5, 0],
  ['Lunch', 12.9, 0],
  ['Bus ticket', 2, 1],
  ['Electricity bill', 54.2, 2],
  ['Groceries', 31.75, 3],
  ['Cinema', 9.5, 6],
];

export function createSeedExpenses(): Expense[] {
  return SEED.map(([title, amount, daysAgo], i) => ({
    id: `seed-${i + 1}`,
    title,
    amount,
    category: CATEGORIES[i % CATEGORIES.length],
    date: isoDaysAgo(daysAgo),
  }));
}

// Connection to the remote repo lives outside the state: it is not something screens render.
let currentRepo: ExpensesRepo | null = null;
let stopListening: (() => void) | null = null;

let counter = 0;
const newId = () => `e${Date.now().toString(36)}${(counter++).toString(36)}`;

/**
 * Global expenses store (Zustand). Unlike React context, a component that reads
 * only one slice (a selector) re-renders only when that slice changes.
 */
export const useExpenseStore = create<ExpensesState>()((set, get) => {
  const reportFailure = (error: unknown) =>
    set({
      syncStatus: 'error',
      syncError: error instanceof Error ? error.message : 'Could not save your change',
    });

  // Writes are optimistic: the UI changes first, the remote copy follows.
  // The repo's snapshots then replace the list with the real data (and undo a rejected write).
  const write = (action: (repo: ExpensesRepo) => Promise<void>) => {
    if (!currentRepo) return;
    action(currentRepo).catch(reportFailure);
  };

  return {
    expenses: createSeedExpenses(),
    syncStatus: 'local',
    syncError: null,

    add: (values) => {
      const expense: Expense = { ...values, id: newId() };
      set((s) => ({ expenses: [expense, ...s.expenses] }));
      write((repo) => repo.add(expense));
      return expense;
    },

    update: (id, values) => {
      const updated: Expense = { ...values, id };
      set((s) => ({
        expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...values, id } : e)),
      }));
      write((repo) => repo.update(updated));
    },

    remove: (id) => {
      set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
      write((repo) => repo.remove(id));
    },

    connect: (repo) => {
      get().disconnect();
      currentRepo = repo;
      set({ expenses: [], syncStatus: 'loading', syncError: null });
      stopListening = repo.subscribe(
        (expenses) => set({ expenses, syncStatus: 'synced', syncError: null }),
        (error) => set({ syncStatus: 'error', syncError: error.message }),
      );
    },

    // Also empties the list, so the next account never sees the previous user's data.
    disconnect: () => {
      stopListening?.();
      stopListening = null;
      currentRepo = null;
      set({ expenses: [], syncStatus: 'local', syncError: null });
    },
  };
});

// Selectors: small functions that pick exactly what a component needs.
export const selectExpenseById = (id: string) => (s: ExpensesState) =>
  s.expenses.find((e) => e.id === id);

export const selectTotal = (s: ExpensesState) =>
  s.expenses.reduce((sum, e) => sum + e.amount, 0);