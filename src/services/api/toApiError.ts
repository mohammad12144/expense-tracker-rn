import { isAxiosError, isCancel } from 'axios';
import { ApiError, isApiError } from './ApiError';

/** Turns anything thrown by axios or fetch into one ApiError type. */
export function toApiError(e: unknown): ApiError {
  if (isApiError(e)) return e;
  if (isCancel(e)) return new ApiError('cancelled');
  if (isAxiosError(e)) {
    if (e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT') return new ApiError('timeout');
    if (e.response) return new ApiError('http', e.response.status);
    return new ApiError('network');
  }
  if (e instanceof Error && e.name === 'AbortError') return new ApiError('cancelled');
  return new ApiError('network');
}