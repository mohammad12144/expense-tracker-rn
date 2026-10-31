import { useMemo, useState } from 'react';
import { useExpensesStore } from '../context/ExpensesContext';
import { Category } from '../types/expense';

export function useExpenses(query: string) {
  const { expenses, remove } = useExpensesStore();
  const [category, setCategory] = useState<Category | 'All'>('All');

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

  return { visible, category, setCategory, remove, total, thisMonth };
}