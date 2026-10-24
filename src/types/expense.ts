export type Category = 'Food' | 'Transport' | 'Bills' | 'Shopping' | 'Other';

export const CATEGORIES: Category[] = ['Food', 'Transport', 'Bills', 'Shopping', 'Other'];

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string; // YYYY-MM-DD
}