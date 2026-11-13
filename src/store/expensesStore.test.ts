/// <reference types="node" />
import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  createSeedExpenses,
  selectExpenseById,
  selectTotal,
  useExpenseStore,
} from './expensesStore';

const values = { title: 'Tea', amount: 2.5, category: 'Food', date: '2026-11-13' } as const;

beforeEach(() => {
  useExpenseStore.setState({ expenses: createSeedExpenses() });
});

describe('expenses store', () => {
  it('starts with seed data that has valid ids and dates', () => {
    const { expenses } = useExpenseStore.getState();
    assert.ok(expenses.length > 0);
    assert.equal(new Set(expenses.map((e) => e.id)).size, expenses.length);
    for (const e of expenses) assert.match(e.date, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('add puts the new expense first and returns it with an id', () => {
    const before = useExpenseStore.getState().expenses.length;
    const created = useExpenseStore.getState().add(values);
    const { expenses } = useExpenseStore.getState();
    assert.equal(expenses.length, before + 1);
    assert.equal(expenses[0], created);
    assert.ok(created.id.length > 0);
  });

  it('gives every added expense a different id', () => {
    const a = useExpenseStore.getState().add(values);
    const b = useExpenseStore.getState().add(values);
    assert.notEqual(a.id, b.id);
  });

  it('update changes only the matching expense and keeps its id', () => {
    const [first, second] = useExpenseStore.getState().expenses;
    useExpenseStore.getState().update(first.id, { ...values, title: 'Changed' });
    const { expenses } = useExpenseStore.getState();
    assert.equal(expenses[0].title, 'Changed');
    assert.equal(expenses[0].id, first.id);
    assert.equal(expenses[1], second, 'other items keep the same object');
  });

  it('update can clear the note', () => {
    const created = useExpenseStore.getState().add({ ...values, note: 'hello' });
    useExpenseStore.getState().update(created.id, { ...values, note: undefined });
    assert.equal(selectExpenseById(created.id)(useExpenseStore.getState())?.note, undefined);
  });

  it('remove deletes by id and ignores unknown ids', () => {
    const { expenses } = useExpenseStore.getState();
    useExpenseStore.getState().remove(expenses[0].id);
    assert.equal(useExpenseStore.getState().expenses.length, expenses.length - 1);
    useExpenseStore.getState().remove('does-not-exist');
    assert.equal(useExpenseStore.getState().expenses.length, expenses.length - 1);
  });

  it('selectors find an expense and sum the total', () => {
    const state = useExpenseStore.getState();
    const target = state.expenses[2];
    assert.equal(selectExpenseById(target.id)(state), target);
    assert.equal(selectExpenseById('nope')(state), undefined);
    const expected = state.expenses.reduce((s, e) => s + e.amount, 0);
    assert.equal(selectTotal(state), expected);
  });

  it('notifies subscribers on change', () => {
    let calls = 0;
    const unsubscribe = useExpenseStore.subscribe(() => {
      calls += 1;
    });
    useExpenseStore.getState().add(values);
    unsubscribe();
    useExpenseStore.getState().add(values);
    assert.equal(calls, 1);
  });
});