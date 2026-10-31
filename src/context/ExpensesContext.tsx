import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { Expense } from '../types/expense';

const daysAgo = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const SEED: Expense[] = [
  { id: '1', title: 'Groceries', amount: 54.2, category: 'Food', date: daysAgo(0) },
  { id: '2', title: 'Bus pass', amount: 20, category: 'Transport', date: daysAgo(0) },
  { id: '3', title: 'Electricity', amount: 80.5, category: 'Bills', date: daysAgo(1), note: 'October bill' },
  { id: '4', title: 'Lunch', amount: 12.75, category: 'Food', date: daysAgo(1) },
  { id: '5', title: 'Headphones', amount: 39.99, category: 'Shopping', date: daysAgo(3) },
];

type ExpenseInput = Omit<Expense, 'id'>;

interface ExpensesStore {
  expenses: Expense[];
  add: (e: ExpenseInput) => void;
  update: (id: string, changes: ExpenseInput) => void;
  remove: (id: string) => void;
  getById: (id: string) => Expense | undefined;
}

const ExpensesContext = createContext<ExpensesStore | null>(null);

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>(SEED);

  const add = useCallback((e: ExpenseInput) => {
    setExpenses((prev) => [{ ...e, id: String(Date.now()) }, ...prev]);
  }, []);

  const update = useCallback((id: string, changes: ExpenseInput) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...changes, id } : e)));
  }, []);

  const remove = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const getById = useCallback(
    (id: string) => expenses.find((e) => e.id === id),
    [expenses],
  );

  const value = useMemo(
    () => ({ expenses, add, update, remove, getById }),
    [expenses, add, update, remove, getById],
  );
  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpensesStore(): ExpensesStore {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error('useExpensesStore must be used inside ExpensesProvider');
  return ctx;
}