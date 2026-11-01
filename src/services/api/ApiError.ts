export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'parse' | 'cancelled';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, status?: number) {
    super(`${kind}${status ? ` ${status}` : ''}`);
    Object.setPrototypeOf(this, ApiError.prototype);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }

  /** Text that is safe to show to the user. */
  get userMessage(): string {
    switch (this.kind) {
      case 'network':
        return 'Cannot reach the server. Check your internet connection.';
      case 'timeout':
        return 'The request took too long. Please try again.';
      case 'parse':
        return 'The server sent an unexpected response.';
      case 'cancelled':
        return 'The request was cancelled.';
      case 'http':
        return this.status !== undefined && this.status >= 500
          ? `Server error (${this.status}). Try again later.`
          : `Request failed (${this.status}).`;
    }
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}