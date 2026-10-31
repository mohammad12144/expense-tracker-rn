import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { Expense } from '../types/expense';

const today = new Date().toISOString().slice(0, 10);

const SEED: Expense[] = [
  { id: '1', title: 'Groceries', amount: 54.2, category: 'Food', date: today },
  { id: '2', title: 'Bus pass', amount: 20, category: 'Transport', date: today },
  { id: '3', title: 'Electricity', amount: 80.5, category: 'Bills', date: today },
];

interface ExpensesStore {
  expenses: Expense[];
  add: (e: Omit<Expense, 'id'>) => void;
  remove: (id: string) => void;
  getById: (id: string) => Expense | undefined;
}

const ExpensesContext = createContext<ExpensesStore | null>(null);

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>(SEED);

  const add = useCallback((e: Omit<Expense, 'id'>) => {
    setExpenses((prev) => [{ ...e, id: String(Date.now()) }, ...prev]);
  }, []);

  const remove = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const getById = useCallback(
    (id: string) => expenses.find((e) => e.id === id),
    [expenses],
  );

  const value = useMemo(
    () => ({ expenses, add, remove, getById }),
    [expenses, add, remove, getById],
  );
  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpensesStore(): ExpensesStore {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error('useExpensesStore must be used inside ExpensesProvider');
  return ctx;
}