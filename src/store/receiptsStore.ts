import { create } from 'zustand';

interface ReceiptsState {
  /** expense id -> photo uri. Kept on this device only (not synced to Firestore). */
  byExpense: Record<string, string>;
  setReceipt: (expenseId: string, uri: string) => void;
  removeReceipt: (expenseId: string) => void;
}

export const useReceipts = create<ReceiptsState>()((set) => ({
  byExpense: {},

  setReceipt: (expenseId, uri) =>
    set((s) => ({ byExpense: { ...s.byExpense, [expenseId]: uri } })),

  removeReceipt: (expenseId) =>
    set((s) => {
      if (!(expenseId in s.byExpense)) return s;
      const { [expenseId]: _removed, ...rest } = s.byExpense;
      return { byExpense: rest };
    }),
}));

export const selectReceipt = (expenseId: string) => (s: ReceiptsState) => s.byExpense[expenseId];