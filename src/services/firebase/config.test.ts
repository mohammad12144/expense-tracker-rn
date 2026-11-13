/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFirebaseConfig } from './config';

const FULL = {
  apiKey: 'key',
  authDomain: 'demo.firebaseapp.com',
  projectId: 'demo',
  appId: '1:123:web:abc',
};

describe('readFirebaseConfig', () => {
  it('returns the config when every required value is present', () => {
    assert.deepEqual(readFirebaseConfig({ ...FULL, storageBucket: 'demo.appspot.com' }), {
      ...FULL,
      storageBucket: 'demo.appspot.com',
      messagingSenderId: undefined,
    });
  });
  it('returns null when a required value is missing or blank', () => {
    for (const key of Object.keys(FULL) as (keyof typeof FULL)[]) {
      assert.equal(readFirebaseConfig({ ...FULL, [key]: undefined }), null, key);
      assert.equal(readFirebaseConfig({ ...FULL, [key]: '   ' }), null, key);
    }
    assert.equal(readFirebaseConfig({}), null);
  });
  it('trims whitespace', () => {
    assert.equal(readFirebaseConfig({ ...FULL, apiKey: '  key  ' })?.apiKey, 'key');
  });
});