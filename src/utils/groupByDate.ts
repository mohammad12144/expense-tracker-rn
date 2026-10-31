import { Expense } from '../types/expense';

export interface ExpenseSection {
  title: string;
  total: number;
  data: Expense[];
}

export function groupByDate(items: Expense[]): ExpenseSection[] {
  const map = new Map<string, Expense[]>();
  for (const e of items) {
    const list = map.get(e.date);
    if (list) list.push(e);
    else map.set(e.date, [e]);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([title, data]) => ({
      title,
      total: data.reduce((sum, e) => sum + e.amount, 0),
      data,
    }));
}