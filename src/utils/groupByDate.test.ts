/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Expense } from '../types/expense';
import { groupByDate } from './groupByDate';

const make = (id: string, amount: number, date: string): Expense => ({
  id,
  title: `Item ${id}`,
  amount,
  category: 'Other',
  date,
});

describe('groupByDate', () => {
  it('returns no sections for an empty list', () => {
    assert.deepEqual(groupByDate([]), []);
  });

  it('groups by date, newest first, with day totals', () => {
    const sections = groupByDate([
      make('1', 10, '2026-10-29'),
      make('2', 5, '2026-10-31'),
      make('3', 2.5, '2026-10-31'),
    ]);
    assert.deepEqual(
      sections.map((s) => [s.title, s.total, s.data.length]),
      [
        ['2026-10-31', 7.5, 2],
        ['2026-10-29', 10, 1],
      ],
    );
  });

  it('keeps the order of items inside a day', () => {
    const [section] = groupByDate([make('a', 1, '2026-10-31'), make('b', 2, '2026-10-31')]);
    assert.deepEqual(section.data.map((e) => e.id), ['a', 'b']);
  });
});