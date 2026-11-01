import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../services/api/ApiError';
import { toApiError } from '../services/api/toApiError';

interface State<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
}

/**
 * Runs `task` when it changes (and when reload() is called).
 * The previous data is kept while reloading, and stale responses are ignored.
 * `task` must be stable (wrap it in useCallback).
 */
export function useAsync<T>(task: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));

    task(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, error: null, loading: false });
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setState((s) => ({ ...s, error: toApiError(e), loading: false }));
      });

    return () => controller.abort();
  }, [task, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, reload };
}