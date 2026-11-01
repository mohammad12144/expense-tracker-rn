/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatMoney } from './format';

describe('formatMoney', () => {
  it('formats with a dollar sign and two decimals', () => {
    assert.equal(formatMoney(5), '$5.00');
    assert.equal(formatMoney(54.2), '$54.20');
    assert.equal(formatMoney(0), '$0.00');
  });
});