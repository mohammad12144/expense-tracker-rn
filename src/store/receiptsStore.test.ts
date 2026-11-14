/// <reference types="node" />
import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { selectReceipt, useReceipts } from './receiptsStore';

beforeEach(() => useReceipts.setState({ byExpense: {} }));

describe('receipts store', () => {
  it('stores a photo per expense', () => {
    useReceipts.getState().setReceipt('a', 'file://a.jpg');
    useReceipts.getState().setReceipt('b', 'file://b.jpg');
    assert.equal(selectReceipt('a')(useReceipts.getState()), 'file://a.jpg');
    assert.equal(selectReceipt('b')(useReceipts.getState()), 'file://b.jpg');
    assert.equal(selectReceipt('c')(useReceipts.getState()), undefined);
  });

  it('replaces the photo when a new one is chosen', () => {
    useReceipts.getState().setReceipt('a', 'file://old.jpg');
    useReceipts.getState().setReceipt('a', 'file://new.jpg');
    assert.equal(selectReceipt('a')(useReceipts.getState()), 'file://new.jpg');
  });

  it('removes only the chosen receipt', () => {
    useReceipts.getState().setReceipt('a', 'x');
    useReceipts.getState().setReceipt('b', 'y');
    useReceipts.getState().removeReceipt('a');
    assert.deepEqual(useReceipts.getState().byExpense, { b: 'y' });
  });

  it('ignores removing a receipt that does not exist (no needless update)', () => {
    useReceipts.getState().setReceipt('a', 'x');
    const before = useReceipts.getState().byExpense;
    useReceipts.getState().removeReceipt('nope');
    assert.equal(useReceipts.getState().byExpense, before);
  });

  it('does not mutate the previous state object', () => {
    useReceipts.getState().setReceipt('a', 'x');
    const before = useReceipts.getState().byExpense;
    useReceipts.getState().setReceipt('b', 'y');
    assert.deepEqual(before, { a: 'x' });
  });
});