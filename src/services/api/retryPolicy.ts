import { isApiError } from './ApiError';

export const MAX_RETRIES = 2;

/** Retry only problems that can go away by themselves (network, timeout, 5xx). */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  if (!isApiError(error)) return false;
  switch (error.kind) {
    case 'network':
    case 'timeout':
      return true;
    case 'http':
      return error.status !== undefined && error.status >= 500;
    case 'parse':
    case 'cancelled':
      return false;
  }
}

/** 1s, 2s, 4s ... capped at 8s. `attempt` starts at 0. */
export function retryDelay(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, 8000);
}