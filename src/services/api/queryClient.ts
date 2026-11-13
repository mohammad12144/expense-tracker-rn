import { QueryClient } from '@tanstack/react-query';
import { retryDelay, shouldRetry } from './retryPolicy';

interface Options {
  retryDelay?: (attempt: number) => number;
}

export function createQueryClient(options: Options = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // data is "fresh" for 5 minutes: no refetch
        gcTime: 30 * 60 * 1000, // unused data is kept in cache for 30 minutes
        retry: shouldRetry,
        retryDelay: options.retryDelay ?? retryDelay,
        // Send the request even when the browser says "offline", so the user sees our error state.
        networkMode: 'always',
      },
    },
  });
}

export const queryClient = createQueryClient();