/// <reference types="node" />
import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { CURRENCIES, usePreferences } from './preferencesStore';

beforeEach(() => usePreferences.getState().reset());

describe('preferences store', () => {
  it('has sensible defaults', () => {
    const s = usePreferences.getState();
    assert.equal(s.client, 'axios');
    assert.deepEqual(s.targets, ['EUR', 'GBP', 'JOD', 'ILS']);
  });

  it('switches the HTTP client', () => {
    usePreferences.getState().setClient('fetch');
    assert.equal(usePreferences.getState().client, 'fetch');
  });

  it('toggles a currency on and off', () => {
    usePreferences.getState().toggleTarget('SAR');
    assert.ok(usePreferences.getState().targets.includes('SAR'));
    usePreferences.getState().toggleTarget('SAR');
    assert.ok(!usePreferences.getState().targets.includes('SAR'));
  });

  it('keeps the currencies in the standard order', () => {
    usePreferences.getState().toggleTarget('EGP');
    usePreferences.getState().toggleTarget('SAR');
    const order = usePreferences.getState().targets.map((c) => CURRENCIES.indexOf(c));
    assert.deepEqual(order, [...order].sort((a, b) => a - b));
  });

  it('never lets the last currency be removed', () => {
    for (const code of ['EUR', 'GBP', 'JOD']) {
      usePreferences.getState().toggleTarget(code as (typeof CURRENCIES)[number]);
    }
    assert.deepEqual(usePreferences.getState().targets, ['ILS']);
    usePreferences.getState().toggleTarget('ILS');
    assert.deepEqual(usePreferences.getState().targets, ['ILS']);
  });
});