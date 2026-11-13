/// <reference types="node" />
import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { Expense } from '../types/expense';
import { createSeedExpenses, ExpensesRepo, useExpenseStore } from './expensesStore';

const values = { title: 'Tea', amount: 2.5, category: 'Food', date: '2026-11-13' } as const;
const remote: Expense = { id: 'r1', ...values };

/** A fake Firestore: records calls and lets the test push snapshots or errors. */
function fakeRepo() {
  const calls: string[] = [];
  let push: (list: Expense[]) => void = () => {};
  let fail: (e: Error) => void = () => {};
  let unsubscribed = 0;
  let rejectWrites = false;
  const write = (name: string) => {
    calls.push(name);
    return rejectWrites ? Promise.reject(new Error('permission-denied')) : Promise.resolve();
  };
  const repo: ExpensesRepo = {
    subscribe: (onData, onError) => {
      push = onData;
      fail = onError;
      return () => {
        unsubscribed += 1;
      };
    },
    add: (e) => write(`add:${e.id}`),
    update: (e) => write(`update:${e.id}`),
    remove: (id) => write(`remove:${id}`),
  };
  return {
    repo,
    calls,
    push: (l: Expense[]) => push(l),
    fail: (e: Error) => fail(e),
    unsubscribed: () => unsubscribed,
    rejectWrites: () => {
      rejectWrites = true;
    },
  };
}

const state = () => useExpenseStore.getState();
const tick = () => new Promise((resolve) => setImmediate(resolve));

beforeEach(() => {
  state().disconnect();
  useExpenseStore.setState({ expenses: createSeedExpenses() });
});

describe('expenses store + remote sync', () => {
  it('stays local (with seed data) until a repo is connected', () => {
    assert.equal(state().syncStatus, 'local');
    assert.ok(state().expenses.length > 0);
  });

  it('connect clears the list and shows loading until the first snapshot', () => {
    const fake = fakeRepo();
    state().connect(fake.repo);
    assert.equal(state().syncStatus, 'loading');
    assert.deepEqual(state().expenses, []);
    fake.push([remote]);
    assert.equal(state().syncStatus, 'synced');
    assert.deepEqual(state().expenses, [remote]);
  });

  it('writes go to the repo and also update the UI immediately', () => {
    const fake = fakeRepo();
    state().connect(fake.repo);
    fake.push([remote]);
    const created = state().add(values);
    assert.equal(state().expenses[0], created, 'optimistic update');
    state().update(remote.id, { ...values, title: 'Edited' });
    state().remove(remote.id);
    assert.deepEqual(fake.calls, [`add:${created.id}`, 'update:r1', 'remove:r1']);
  });

  it('a snapshot replaces the optimistic list with the real data', () => {
    const fake = fakeRepo();
    state().connect(fake.repo);
    state().add(values);
    fake.push([remote]);
    assert.deepEqual(state().expenses, [remote]);
  });

  it('shows an error when a write is rejected (e.g. by security rules)', async () => {
    const fake = fakeRepo();
    state().connect(fake.repo);
    fake.rejectWrites();
    state().add(values);
    await tick();
    assert.equal(state().syncStatus, 'error');
    assert.equal(state().syncError, 'permission-denied');
  });

  it('shows an error when the listener fails', () => {
    const fake = fakeRepo();
    state().connect(fake.repo);
    fake.fail(new Error('Missing or insufficient permissions.'));
    assert.equal(state().syncStatus, 'error');
    assert.equal(state().syncError, 'Missing or insufficient permissions.');
  });

  it('disconnect stops listening, empties the list and stops writing remotely', () => {
    const fake = fakeRepo();
    state().connect(fake.repo);
    fake.push([remote]);
    state().disconnect();
    assert.equal(fake.unsubscribed(), 1);
    assert.deepEqual(state().expenses, [], 'no data left for the next user');
    assert.equal(state().syncStatus, 'local');
    state().add(values);
    assert.deepEqual(fake.calls, []);
  });

  it('connecting again first stops the previous listener', () => {
    const first = fakeRepo();
    const second = fakeRepo();
    state().connect(first.repo);
    state().connect(second.repo);
    assert.equal(first.unsubscribed(), 1);
  });
});