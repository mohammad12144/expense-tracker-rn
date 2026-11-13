/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AuthUser, issueToken, parseToken } from './mockAuth';

const USER: AuthUser = { id: '1', name: 'mo', email: 'mo@example.com' };
const NOW = 1_000_000;

describe('mock token', () => {
  it('round-trips a user', () => {
    const token = issueToken(USER, NOW, 1000);
    assert.deepEqual(parseToken(token, NOW + 500), USER);
  });
  it('is rejected once it has expired', () => {
    const token = issueToken(USER, NOW, 1000);
    assert.equal(parseToken(token, NOW + 1000), null);
    assert.equal(parseToken(token, NOW + 5000), null);
  });
  it('rejects garbage and tampered tokens', () => {
    for (const bad of ['', 'abc', 'mock.', 'mock.%7Bnot-json', 'mock.%7B%7D', 'jwt.x.y']) {
      assert.equal(parseToken(bad, NOW), null, bad);
    }
  });
});