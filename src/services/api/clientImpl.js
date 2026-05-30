import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import {
  API_BASE_URL,
  INDEX_POLL_INTERVAL_MS,
  INDEX_POLL_MAX_ATTEMPTS,
} from './config.js';
import {
  fetchWithTimeout,
  INDEX_POLL_TIMEOUT_MS,
  LONG_REQUEST_TIMEOUT_MS,
  requestJson,
  UPLOAD_TIMEOUT_MS,
} from './http.js';
import { PROCESSING_STEPS } from '../../utils/constants';
import {
  DEFAULT_EMBEDDING_DIMENSION,
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_RERANK_MODEL,
  DEFAULT_RETRIEVAL_MODE,
  DEFAULT_SCORE_THRESHOLD,
  DEFAULT_TOP_K,
  DOCUMENT_STATUS,
} from '../../utils/constants';
import { formatFileSize } from '../../utils/formatters';

function mapStepsByPollAttempt(attempt) {
  return PROCESSING_STEPS.map((step, idx) => {
    if (attempt >= 6) return { ...step, state: 'completed' };
    if (idx < Math.min(attempt + 1, PROCESSING_STEPS.length - 1)) {
      return { ...step, state: 'completed' };
    }
    if (idx === Math.min(attempt + 1, PROCESSING_STEPS.length - 1)) {
      return { ...step, state: 'active' };
    }
    return { ...step, state: 'pending' };
  });
}

async function waitForIndexReady(onStepChange) {
  for (let attempt = 0; attempt < INDEX_POLL_MAX_ATTEMPTS; attempt++) {
    onStepChange?.(mapStepsByPollAttempt(attempt));
    const data = await requestJson(`${API_BASE_URL}/`, { method: 'GET', cache: 'no-store' }, INDEX_POLL_TIMEOUT_MS);
    if (data.index_ready) {
      onStepChange?.(PROCESSING_STEPS.map((s) => ({ ...s, state: 'completed' })));
      return data;
    }
    await new Promise((r) => setTimeout(r, INDEX_POLL_INTERVAL_MS));
  }
  throw new Error('Index processing timeout. Please try again.');
}

export async function checkHealth() {
  const start = performance.now();
  const data = await requestJson(`${API_BASE_URL}/`, { method: 'GET', cache: 'no-store' }, INDEX_POLL_TIMEOUT_MS);
  const ms = Math.round(performance.now() - start);
  return {
    status: data.health === 'ok' ? 'ready' : 'initializing',
    latency: `${ms}ms`,
    health: data.health,
    index_ready: data.index_ready,
  };
}

export async function processDocument(file, onStepChange, { replace = true } = {}) {
  onStepChange?.(PROCESSING_STEPS.map((s, i) => ({ ...s, state: i === 0 ? 'active' : 'pending' })));

  const formData = new FormData();
  formData.append('file', file);

  const uploadData = await (async () => {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/upload?replace=${replace}`,
      { method: 'POST', body: formData },
      UPLOAD_TIMEOUT_MS,
    );
    const text = await response.text().catch(() => '');
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        if (response.ok) throw new Error('Invalid JSON from upload endpoint');
      }
    }
    if (!response.ok) {
      throw new Error(data?.detail || 'Upload failed');
    }
    return data;
  })();

  await waitForIndexReady(onStepChange);

  const pages = uploadData.pages ?? 24;
  const chunks = uploadData.chunks ?? 120;

  return {
    id: `doc-${uuidv4().slice(0, 8)}`,
    fileName: file.name,
    status: DOCUMENT_STATUS.INDEXED,
    pages,
    fileSize: formatFileSize(file.size),
    fileSizeBytes: file.size,
    chunks,
    uploadedAt: format(new Date(), 'MMMM d, yyyy h:mm a'),
    embeddingModel: DEFAULT_EMBEDDING_MODEL,
    embeddingDimension: DEFAULT_EMBEDDING_DIMENSION,
    retrievalMode: DEFAULT_RETRIEVAL_MODE,
    topK: DEFAULT_TOP_K,
    scoreThreshold: DEFAULT_SCORE_THRESHOLD,
    rerankModel: DEFAULT_RERANK_MODEL,
  };
}

export async function askQuestion(_documentId, question) {
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
  const citations = Array.isArray(data.sources) ? data.sources : data.citations ?? [];
  return {
    answer: data.answer,
    citations,
    latency: `${ms}ms`,
  };
}

export async function clearWorkspace() {
  return requestJson(`${API_BASE_URL}/clear`, { method: 'DELETE' }, LONG_REQUEST_TIMEOUT_MS);
}
