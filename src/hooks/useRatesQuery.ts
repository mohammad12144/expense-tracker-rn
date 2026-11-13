import { useQuery } from '@tanstack/react-query';
import { ApiError } from '../services/api/ApiError';
import { getRates, RatesClient, RatesResult } from '../services/api/rates';

export const ratesKey = (base: string, client: RatesClient) => ['rates', base, client] as const;

/**
 * TanStack Query keeps the result in a cache keyed by ratesKey().
 * Switching client and coming back is instant, and old data stays visible while refetching.
 */
export function useRatesQuery(client: RatesClient) {
  return useQuery<RatesResult, ApiError>({
    queryKey: ratesKey('USD', client),
    queryFn: ({ signal }) => getRates(client, 'USD', { signal }),
  });
}