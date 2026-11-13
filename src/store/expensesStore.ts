import { create } from 'zustand';
import { CATEGORIES, Expense } from '../types/expense';

export type NewExpense = Omit<Expense, 'id'>;

interface ExpensesState {
  expenses: Expense[];
  add: (values: NewExpense) => Expense;
  update: (id: string, values: NewExpense) => void;
  remove: (id: string) => void;
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

let counter = 0;
const newId = () => `e${Date.now().toString(36)}${(counter++).toString(36)}`;

/**
 * Global expenses store (Zustand). Unlike React context, a component that reads
 * only one slice (a selector) re-renders only when that slice changes.
 */
export const useExpenseStore = create<ExpensesState>()((set) => ({
  expenses: createSeedExpenses(),

  add: (values) => {
    const expense: Expense = { ...values, id: newId() };
    set((s) => ({ expenses: [expense, ...s.expenses] }));
    return expense;
  },

  update: (id, values) =>
    set((s) => ({
      expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...values, id } : e)),
    })),

  remove: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
}));

// Selectors: small functions that pick exactly what a component needs.
export const selectExpenseById = (id: string) => (s: ExpensesState) =>
  s.expenses.find((e) => e.id === id);

export const selectTotal = (s: ExpensesState) =>
  s.expenses.reduce((sum, e) => sum + e.amount, 0);