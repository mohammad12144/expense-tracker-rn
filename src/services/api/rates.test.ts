/// <reference types="node" />
import assert from 'node:assert/strict';
import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';
import { ApiError } from './ApiError';
import { getRatesAxios, getRatesFetch, parseRates, RatesClient } from './rates';

const GOOD = {
  result: 'success',
  base_code: 'USD',
  time_last_update_utc: 'Sun, 01 Nov 2026 00:00:01 +0000',
  rates: { USD: 1, EUR: 0.9, JOD: 0.71, BAD: 'x' },
};

let server: Server;
let baseUrl = '';

function handler(req: IncomingMessage, res: ServerResponse) {
  const path = req.url ?? '';
  if (path.includes('/ok')) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(GOOD));
  } else if (path.includes('/missing')) {
    res.statusCode = 404;
    res.end('nope');
  } else if (path.includes('/boom')) {
    res.statusCode = 500;
    res.end('boom');
  } else if (path.includes('/garbage')) {
    res.setHeader('Content-Type', 'application/json');
    res.end('{not json');
  } else if (path.includes('/wrong')) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ result: 'error' }));
  } else if (path.includes('/slow')) {
    setTimeout(() => {
      res.end(JSON.stringify(GOOD));
    }, 400);
  } else {
    res.statusCode = 400;
    res.end();
  }
}

before(async () => {
  server = createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.closeAllConnections();
  server.close();
});

async function failure(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (e) {
    assert.ok(e instanceof ApiError, 'expected an ApiError');
    return e;
  }
  throw new Error('expected the request to fail');
}

describe('parseRates', () => {
  it('keeps only numeric rates', () => {
    const result = parseRates(GOOD);
    assert.equal(result.base, 'USD');
    assert.deepEqual(result.rates, { USD: 1, EUR: 0.9, JOD: 0.71 });
  });
  it('rejects unexpected shapes', () => {
    for (const bad of [null, 'x', {}, { result: 'error' }, { result: 'success', base_code: 'USD' }]) {
      assert.throws(() => parseRates(bad), (e: unknown) => e instanceof ApiError && e.kind === 'parse');
    }
  });
});

const clients: [RatesClient, typeof getRatesAxios][] = [
  ['axios', getRatesAxios],
  ['fetch', getRatesFetch],
];

for (const [name, get] of clients) {
  describe(`getRates (${name})`, () => {
    it('returns parsed rates on success', async () => {
      const result = await get('ok', { baseUrl });
      assert.equal(result.base, 'USD');
      assert.equal(result.rates.JOD, 0.71);
    });
    it('maps 404 and 500 to http errors', async () => {
      const notFound = await failure(get('missing', { baseUrl }));
      assert.deepEqual([notFound.kind, notFound.status], ['http', 404]);
      const boom = await failure(get('boom', { baseUrl }));
      assert.deepEqual([boom.kind, boom.status], ['http', 500]);
      assert.match(boom.userMessage, /Server error/);
    });
    it('maps invalid JSON and wrong shapes to parse errors', async () => {
      assert.equal((await failure(get('garbage', { baseUrl }))).kind, 'parse');
      assert.equal((await failure(get('wrong', { baseUrl }))).kind, 'parse');
    });
    it('maps a slow server to a timeout', async () => {
      const e = await failure(get('slow', { baseUrl, timeoutMs: 50 }));
      assert.equal(e.kind, 'timeout');
    });
    it('maps an unreachable server to a network error', async () => {
      const e = await failure(get('ok', { baseUrl: 'http://127.0.0.1:1' }));
      assert.equal(e.kind, 'network');
    });
    it('maps an aborted request to cancelled', async () => {
      const controller = new AbortController();
      const pending = failure(get('slow', { baseUrl, signal: controller.signal }));
      controller.abort();
      assert.equal((await pending).kind, 'cancelled');
    });
  });
}