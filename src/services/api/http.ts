import axios, { AxiosInstance } from 'axios';
import { toApiError } from './toApiError';

export const RATES_BASE_URL = 'https://open.er-api.com/v6';
export const DEFAULT_TIMEOUT_MS = 10000;

export function createHttp(baseURL: string, timeoutMs = DEFAULT_TIMEOUT_MS): AxiosInstance {
  const instance = axios.create({ baseURL, timeout: timeoutMs });
  // One place that converts every failure into an ApiError.
  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(toApiError(error)),
  );
  return instance;
}