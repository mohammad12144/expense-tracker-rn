/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validateAmount, validateDate } from './expenseValidators';

describe('validateAmount', () => {
  it('rejects empty, zero, negative and non-numeric values', () => {
    for (const v of ['', ' ', '0', '-5', 'abc']) {
      assert.equal(validateAmount(v), 'Enter an amount greater than 0', v);
    }
  });
  it('accepts positive numbers', () => {
    assert.equal(validateAmount('4.5'), null);
    assert.equal(validateAmount('100'), null);
  });
});

describe('validateDate', () => {
  it('rejects the wrong format', () => {
    assert.equal(validateDate('31-10-2026'), 'Use the format YYYY-MM-DD');
    assert.equal(validateDate(''), 'Use the format YYYY-MM-DD');
  });
  it('rejects impossible calendar dates', () => {
    assert.equal(validateDate('2026-13-45'), 'Enter a valid date');
    assert.equal(validateDate('2026-02-30'), 'Enter a valid date');
  });
  it('handles leap years', () => {
    assert.equal(validateDate('2028-02-29'), null);
    assert.equal(validateDate('2027-02-29'), 'Enter a valid date');
  });
  it('accepts a normal date', () => {
    assert.equal(validateDate('2026-10-31'), null);
  });
});