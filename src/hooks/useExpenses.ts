import { useMemo, useState } from 'react';
import { useExpensesStore } from '../context/ExpensesContext';
import { Category } from '../types/expense';
import { ExpenseSection, groupByDate } from '../utils/groupByDate';

export type SortMode = 'newest' | 'amount';

export function useExpenses(query: string) {
  const { expenses, remove } = useExpensesStore();
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [sort, setSort] = useState<SortMode>('newest');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses.filter(
      (e) =>
        (category === 'All' || e.category === category) &&
        (!q || e.title.toLowerCase().includes(q)),
    );
  }, [expenses, category, query]);

  const sections: ExpenseSection[] = useMemo(() => {
    if (sort === 'newest') return groupByDate(visible);
    if (visible.length === 0) return [];
    const sorted = [...visible].sort((a, b) => b.amount - a.amount);
    return [
      {
        title: 'Highest amount first',
        total: sorted.reduce((s, e) => s + e.amount, 0),
        data: sorted,
      },
    ];
  }, [visible, sort]);

  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  const thisMonth = useMemo(() => {
    const prefix = new Date().toISOString().slice(0, 7);
    return expenses
      .filter((e) => e.date.startsWith(prefix))
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  return {
    sections,
    count: visible.length,
    category,
    setCategory,
    sort,
    setSort,
    remove,
    total,
    thisMonth,
  };
}