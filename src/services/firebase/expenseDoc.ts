import { CATEGORIES, Category, Expense } from '../../types/expense';

/** Expense -> plain object for Firestore (which rejects `undefined` values). */
export function toExpenseDoc(e: Expense): Record<string, string | number> {
  const doc: Record<string, string | number> = {
    title: e.title,
    amount: e.amount,
    category: e.category,
    date: e.date,
  };
  if (e.note) doc.note = e.note;
  return doc;
}

const isCategory = (v: unknown): v is Category =>
  typeof v === 'string' && (CATEGORIES as readonly string[]).includes(v);

/** Firestore data -> Expense. Returns null for malformed documents so one bad doc cannot break the list. */
export function fromExpenseDoc(id: string, data: unknown): Expense | null {
  if (typeof data !== 'object' || data === null) return null;
  const d = data as Record<string, unknown>;
  if (typeof d.title !== 'string' || d.title.trim() === '') return null;
  if (typeof d.amount !== 'number' || !Number.isFinite(d.amount)) return null;
  if (!isCategory(d.category)) return null;
  if (typeof d.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return null;
  const expense: Expense = {
    id,
    title: d.title,
    amount: d.amount,
    category: d.category,
    date: d.date,
  };
  if (typeof d.note === 'string' && d.note) expense.note = d.note;
  return expense;
}