/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Expense } from '../../types/expense';
import { fromExpenseDoc, toExpenseDoc } from './expenseDoc';

const FULL: Expense = {
  id: 'a1',
  title: 'Coffee',
  amount: 3.5,
  category: 'Food',
  date: '2026-11-13',
  note: 'with milk',
};

describe('toExpenseDoc', () => {
  it('drops the id (it is the document name) and keeps the other fields', () => {
    assert.deepEqual(toExpenseDoc(FULL), {
      title: 'Coffee',
      amount: 3.5,
      category: 'Food',
      date: '2026-11-13',
      note: 'with milk',
    });
  });
  it('omits an empty note instead of sending undefined (Firestore rejects undefined)', () => {
    const doc = toExpenseDoc({ ...FULL, note: undefined });
    assert.equal('note' in doc, false);
    assert.equal(Object.values(doc).includes(undefined as never), false);
  });
});

describe('fromExpenseDoc', () => {
  it('round-trips an expense', () => {
    assert.deepEqual(fromExpenseDoc('a1', toExpenseDoc(FULL)), FULL);
  });
  it('works without a note', () => {
    const { note: _note, ...withoutNote } = FULL;
    assert.deepEqual(fromExpenseDoc('a1', toExpenseDoc(withoutNote)), withoutNote);
  });
  it('rejects malformed documents instead of crashing', () => {
    const good = toExpenseDoc(FULL);
    const bad: unknown[] = [
      null,
      'text',
      {},
      { ...good, title: '' },
      { ...good, title: 5 },
      { ...good, amount: '3.5' },
      { ...good, amount: NaN },
      { ...good, category: 'NotACategory' },
      { ...good, date: '13/11/2026' },
      { ...good, date: { seconds: 1 } },
    ];
    for (const doc of bad) assert.equal(fromExpenseDoc('x', doc), null, JSON.stringify(doc));
  });
});