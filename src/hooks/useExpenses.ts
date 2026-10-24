import { useCallback, useMemo, useState } from 'react';
import { Category, Expense } from '../types/expense';

const today = new Date().toISOString().slice(0, 10);

const SEED: Expense[] = [
  { id: '1', title: 'Groceries', amount: 54.2, category: 'Food', date: today },
  { id: '2', title: 'Bus pass', amount: 20, category: 'Transport', date: today },
  { id: '3', title: 'Electricity', amount: 80.5, category: 'Bills', date: today },
];

export function useExpenses(query: string) {
  const [expenses, setExpenses] = useState<Expense[]>(SEED);
  const [category, setCategory] = useState<Category | 'All'>('All');

  const add = useCallback((e: Omit<Expense, 'id'>) => {
    setExpenses((prev) => [{ ...e, id: String(Date.now()) }, ...prev]);
  }, []);

  const remove = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses.filter(
      (e) =>
        (category === 'All' || e.category === category) &&
        (!q || e.title.toLowerCase().includes(q)),
    );
  }, [expenses, category, query]);

  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  const thisMonth = useMemo(() => {
    const prefix = new Date().toISOString().slice(0, 7);
    return expenses
      .filter((e) => e.date.startsWith(prefix))
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  return { visible, category, setCategory, add, remove, total, thisMonth };
}