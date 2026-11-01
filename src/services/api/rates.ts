import { ApiError } from './ApiError';
import { createHttp, DEFAULT_TIMEOUT_MS, RATES_BASE_URL } from './http';
import { toApiError } from './toApiError';

export interface RatesResult {
  base: string;
  updated: string;
  rates: Record<string, number>;
}

export interface RequestOptions {
  signal?: AbortSignal;
  baseUrl?: string;
  timeoutMs?: number;
}

export type RatesClient = 'axios' | 'fetch';

/** Checks the JSON shape before the rest of the app trusts it. */
export function parseRates(data: unknown): RatesResult {
  if (typeof data !== 'object' || data === null) throw new ApiError('parse');
  const d = data as Record<string, unknown>;
  if (d.result !== 'success' || typeof d.base_code !== 'string') throw new ApiError('parse');
  if (typeof d.rates !== 'object' || d.rates === null) throw new ApiError('parse');

  const rates: Record<string, number> = {};
  for (const [code, value] of Object.entries(d.rates)) {
    if (typeof value === 'number' && Number.isFinite(value)) rates[code] = value;
  }
  return {
    base: d.base_code,
    updated: typeof d.time_last_update_utc === 'string' ? d.time_last_update_utc : '',
    rates,
  };
}

/** Version 1: axios (timeout, JSON parsing and error mapping come from the instance). */
export async function getRatesAxios(base: string, options: RequestOptions = {}) {
  const http = createHttp(options.baseUrl ?? RATES_BASE_URL, options.timeoutMs);
  const response = await http.get<unknown>(`/latest/${base}`, { signal: options.signal });
  return parseRates(response.data);
}

/** Version 2: fetch (we write the timeout, status check and JSON parsing ourselves). */
export async function getRatesFetch(base: string, options: RequestOptions = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const onOuterAbort = () => controller.abort();
  options.signal?.addEventListener('abort', onOuterAbort);

  try {
    const response = await fetch(`${options.baseUrl ?? RATES_BASE_URL}/latest/${base}`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new ApiError('http', response.status);
    let json: unknown;
    try {
      json = await response.json();
    } catch {
      throw new ApiError('parse');
    }
    return parseRates(json);
  } catch (e) {
    if (timedOut) throw new ApiError('timeout');
    throw toApiError(e);
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', onOuterAbort);
  }
}

export function getRates(client: RatesClient, base: string, options: RequestOptions = {}) {
  return client === 'axios' ? getRatesAxios(base, options) : getRatesFetch(base, options);
}