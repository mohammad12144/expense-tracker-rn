import { ReactNode, useCallback, useMemo } from 'react';
import { useExpenseStore } from '../store/expensesStore';

/**
 * Compatibility layer: the expenses now live in a Zustand store (src/store/expensesStore.ts).
 * This keeps the old names working, so screens that were not migrated yet need no changes.
 */
export function ExpensesProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useExpensesStore() {
  const expenses = useExpenseStore((s) => s.expenses);
  const add = useExpenseStore((s) => s.add);
  const update = useExpenseStore((s) => s.update);
  const remove = useExpenseStore((s) => s.remove);
  const getById = useCallback((id: string) => expenses.find((e) => e.id === id), [expenses]);

  return useMemo(
    () => ({ expenses, add, update, remove, getById }),
    [expenses, add, update, remove, getById],
  );
}