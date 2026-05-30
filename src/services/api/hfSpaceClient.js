import { API_BASE_URL, LONG_REQUEST_TIMEOUT_MS, REQUEST_TIMEOUT_MS } from './config.js';
import { requestJson } from './http.js';
import { parseSourcesFromResponse, formatConfidence } from '../../utils/parseSources.js';

export async function fetchHealth() {
  const start = performance.now();
  const data = await requestJson(`${API_BASE_URL}/health`, { method: 'GET', cache: 'no-store' });
  const ms = Math.round(performance.now() - start);
  return { ...data, latencyMs: ms, latency: `${ms}ms` };
}

export async function fetchStatus() {
  return requestJson(`${API_BASE_URL}/status`, { method: 'GET', cache: 'no-store' });
}

/** Combined health + status refresh for the app shell. */
export async function refreshApiState() {
  const start = performance.now();
  const [health, status] = await Promise.all([fetchHealth(), fetchStatus()]);
  const totalMs = Math.round(performance.now() - start);
  return {
    health,
    status,
    latency: health.latency ?? `${totalMs}ms`,
    latencyMs: health.latencyMs ?? totalMs,
    checkedAt: new Date().toISOString(),
  };
}

export async function checkHealth() {
  const result = await refreshApiState();
  const ok = result.health?.status === 'ok' || result.health?.api_ready;
  return {
    status: ok ? 'ready' : 'error',
    health: result.health?.status ?? 'unknown',
    latency: result.latency,
    healthData: result.health,
    statusData: result.status,
    checkedAt: result.checkedAt,
  };
}

/**
 * @param {string} question
 * @param {string} [_documentId] Reserved for future API multi-document support (not sent today).
 */
export async function askQuestion(question) {
  const start = performance.now();
  const data = await requestJson(
    `${API_BASE_URL}/ask`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    },
    LONG_REQUEST_TIMEOUT_MS,
  );
  const ms = Math.round(performance.now() - start);

  const parsedSources = parseSourcesFromResponse(data.sources ?? data.citations ?? []);
  const confidence = formatConfidence(data.confidence);

  return {
    answer: data.answer ?? '',
    sources: parsedSources,
    citations: parsedSources.map((s) =>
      s.page != null ? `Page ${s.page}` : s.section || s.fileName || `Chunk ${s.chunkId ?? '—'}`,
    ),
    confidence,
    confidenceRaw: data.confidence,
    latency: `${ms}ms`,
    latencyMs: ms,
    metadata: data.metadata ?? null,
  };
}

export async function pingRoot() {
  return requestJson(`${API_BASE_URL}/`, { method: 'GET', cache: 'no-store' }, REQUEST_TIMEOUT_MS);
}
