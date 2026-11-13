/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError } from './api/ApiError';
import { AuthUser } from './mockAuth';
import { clearToken, KeyValueStore, restoreSession, saveToken, TOKEN_KEY } from './session';

const USER: AuthUser = { id: '1', name: 'mo', email: 'mo@example.com' };

function memoryStore(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const store: KeyValueStore = {
    getItem: async (k) => data.get(k) ?? null,
    setItem: async (k, v) => {
      data.set(k, v);
    },
    removeItem: async (k) => {
      data.delete(k);
    },
  };
  return { store, data };
}

describe('saveToken / clearToken', () => {
  it('stores and removes the token', async () => {
    const { store, data } = memoryStore();
    await saveToken(store, 'abc');
    assert.equal(data.get(TOKEN_KEY), 'abc');
    await clearToken(store);
    assert.equal(data.has(TOKEN_KEY), false);
  });
});

describe('restoreSession', () => {
  it('returns null when nothing is saved (verify is not called)', async () => {
    const { store } = memoryStore();
    let called = false;
    const result = await restoreSession(store, async () => {
      called = true;
      return USER;
    });
    assert.equal(result, null);
    assert.equal(called, false);
  });

  it('restores the session when the server accepts the token', async () => {
    const { store } = memoryStore({ [TOKEN_KEY]: 'good' });
    const result = await restoreSession(store, async (t) => {
      assert.equal(t, 'good');
      return USER;
    });
    assert.deepEqual(result, { token: 'good', user: USER });
  });

  it('deletes the token when the server answers 401', async () => {
    const { store, data } = memoryStore({ [TOKEN_KEY]: 'expired' });
    const result = await restoreSession(store, async () => {
      throw new ApiError('http', 401);
    });
    assert.equal(result, null);
    assert.equal(data.has(TOKEN_KEY), false);
  });

  it('keeps the token when the problem is the network', async () => {
    const { store, data } = memoryStore({ [TOKEN_KEY]: 'maybe-good' });
    const result = await restoreSession(store, async () => {
      throw new ApiError('network');
    });
    assert.equal(result, null);
    assert.equal(data.get(TOKEN_KEY), 'maybe-good');
  });

  it('does not crash when the storage itself fails', async () => {
    const broken: KeyValueStore = {
      getItem: async () => {
        throw new Error('keychain locked');
      },
      setItem: async () => {},
      removeItem: async () => {},
    };
    assert.equal(await restoreSession(broken, async () => USER), null);
  });
});