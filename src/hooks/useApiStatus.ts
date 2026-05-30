import { useCallback, useEffect, useState } from 'react';
import { getHealth } from '../lib/api';
import type { ApiHealthResponse } from '../lib/types';

export type ApiConnectionStatus = 'checking' | 'ready' | 'error';

export function useApiStatus(pollIntervalMs = 30000) {
  const [connectionStatus, setConnectionStatus] = useState<ApiConnectionStatus>('checking');
  const [apiHealth, setApiHealth] = useState<ApiHealthResponse | null>(null);
  const [apiLatency, setApiLatency] = useState<string | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setConnectionStatus('checking');
    setErrorMessage(null);
    try {
      const health = await getHealth();
      setApiHealth(health);
      const latency =
        health.latencyMs != null ? `${health.latencyMs}ms` : null;
      setApiLatency(latency);
      setLastCheckedAt(new Date().toISOString());

      const ready =
        Boolean(health.api_ready ?? health.status === 'ok') &&
        Boolean(health.llm_ready ?? true);

      setConnectionStatus(ready ? 'ready' : 'error');
      return health;
    } catch (err) {
      setConnectionStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to reach DocMind API',
      );
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, pollIntervalMs);
    return () => clearInterval(id);
  }, [refresh, pollIntervalMs]);

  return {
    connectionStatus,
    apiHealth,
    apiLatency,
    lastCheckedAt,
    errorMessage,
    setErrorMessage,
    refresh,
  };
}
