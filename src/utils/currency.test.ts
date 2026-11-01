/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { convert, formatRate } from './currency';

describe('currency', () => {
  it('converts an amount', () => {
    assert.equal(convert(100, 0.71), 71);
  });
  it('formats small rates with 4 decimals and big ones with 2', () => {
    assert.equal(formatRate(0.7100001), '0.7100');
    assert.equal(formatRate(48.5), '48.5000');
    assert.equal(formatRate(1520.1234), '1520.12');
  });
});