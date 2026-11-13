/// <reference types="node" />
import assert from 'node:assert/strict';
import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';
import type { QueryClient } from '@tanstack/react-query';
import { ApiError } from './ApiError';
import { createQueryClient } from './queryClient';
import { getRatesAxios } from './rates';

const GOOD = { result: 'success', base_code: 'USD', rates: { EUR: 0.9 } };

let server: Server;
let baseUrl = '';
const hits = new Map<string, number>();

function handler(req: IncomingMessage, res: ServerResponse) {
  const path = (req.url ?? '').replace('/latest/', '');
  hits.set(path, (hits.get(path) ?? 0) + 1);
  if (path === 'ok') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(GOOD));
  } else if (path === 'boom') {
    res.statusCode = 500;
    res.end();
  } else {
    res.statusCode = 404;
    res.end();
  }
}

before(async () => {
  server = createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

const created: QueryClient[] = [];

after(() => {
  // Clearing the caches cancels their 30-minute garbage-collection timers,
  // otherwise Node would wait for them and the test run would never exit.
  for (const c of created) c.clear();
  server.closeAllConnections();
  server.close();
});

const fast = () => {
  const client = createQueryClient({ retryDelay: () => 1 });
  created.push(client);
  return client;
};
const query = (client: ReturnType<typeof fast>, base: string) =>
  client.fetchQuery({ queryKey: ['rates', base], queryFn: () => getRatesAxios(base, { baseUrl }) });

describe('query client', () => {
  it('caches: a second request inside staleTime does not hit the server', async () => {
    const client = fast();
    const first = await query(client, 'ok');
    const second = await query(client, 'ok');
    assert.equal(second, first, 'same cached object');
    assert.equal(hits.get('ok'), 1);
  });

  it('refetches after the cache is invalidated', async () => {
    hits.delete('ok');
    const client = fast();
    await query(client, 'ok');
    await client.invalidateQueries({ queryKey: ['rates', 'ok'] });
    await query(client, 'ok');
    assert.equal(hits.get('ok'), 2);
  });

  it('retries a 500 twice, then fails (3 requests)', async () => {
    const client = fast();
    await assert.rejects(query(client, 'boom'), (e: unknown) => e instanceof ApiError && e.status === 500);
    assert.equal(hits.get('boom'), 3);
  });

  it('does not retry a 404 (1 request)', async () => {
    const client = fast();
    await assert.rejects(query(client, 'missing'), (e: unknown) => e instanceof ApiError && e.status === 404);
    assert.equal(hits.get('missing'), 1);
  });

  it('uses the expected defaults', () => {
    const q = fast().getDefaultOptions().queries;
    assert.equal(q?.staleTime, 5 * 60 * 1000);
    assert.equal(q?.networkMode, 'always');
  });
});