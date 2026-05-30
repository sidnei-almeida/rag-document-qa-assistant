/**
 * DocMind workspace API client.
 */
import { parseSourcesFromResponse, formatConfidence } from '../utils/parseSources.js';
import { API_BASE_URL } from './env';

export { API_BASE_URL } from './env';
import type {
  ApiHealthResponse,
  AskQuestionResult,
  Source,
  WorkspaceDetail,
  WorkspaceSummary,
  WorkspaceUploadResponse,
} from './types';

const TIMEOUT_HEALTH_MS = 10_000;
const TIMEOUT_ASK_MS = 45_000;
const TIMEOUT_UPLOAD_MS = 180_000;

export class ApiError extends Error {
  status: number;
  detail?: unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

function parseErrorMessage(data: unknown, status: number, fallbackText?: string): string {
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj.error === 'string') return obj.error;
    const detail = obj.detail;
    if (typeof detail === 'string') return detail;
    if (detail && typeof detail === 'object' && typeof (detail as Record<string, unknown>).error === 'string') {
      return (detail as Record<string, unknown>).error as string;
    }
    if (typeof obj.message === 'string') return obj.message;
  }
  if (fallbackText?.trim()) return fallbackText.trim();
  if (status === 0) return 'Unable to reach the API. Check your connection or CORS settings.';
  if (status >= 500) return 'Server error. Please try again later.';
  return `Request failed (${status})`;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const outerSignal = options.signal;
  if (outerSignal) {
    outerSignal.addEventListener('abort', () => controller.abort());
  }
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out.', 408);
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network request failed.',
      0,
    );
  } finally {
    clearTimeout(timer);
  }
}

async function requestJson<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = TIMEOUT_HEALTH_MS,
): Promise<T> {
  let response: Response;
  try {
    response = await fetchWithTimeout(url, options, timeoutMs);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network request failed.', 0);
  }

  const text = await response.text().catch(() => '');
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (response.ok) {
        throw new ApiError('Invalid JSON response from API.', response.status);
      }
    }
  }

  if (!response.ok) {
    throw new ApiError(parseErrorMessage(data, response.status, text), response.status, data);
  }

  return (data ?? {}) as T;
}

function normalizeWorkspaceStatus(raw: unknown): WorkspaceSummary['status'] {
  if (raw === 'ready' || raw === 'processing' || raw === 'error') return raw;
  return 'processing';
}

function mapWorkspaceSummary(raw: Record<string, unknown>): WorkspaceSummary {
  return {
    workspace_id: String(raw.workspace_id ?? ''),
    title: String(raw.title ?? 'Workspace'),
    status: normalizeWorkspaceStatus(raw.status),
    index_ready: Boolean(raw.index_ready),
    document_count: Number(raw.document_count ?? raw.documents?.length ?? 0) || 0,
    total_pages: typeof raw.total_pages === 'number' ? raw.total_pages : undefined,
    total_chunks: typeof raw.total_chunks === 'number' ? raw.total_chunks : undefined,
    created_at: typeof raw.created_at === 'string' ? raw.created_at : undefined,
    updated_at: typeof raw.updated_at === 'string' ? raw.updated_at : undefined,
  };
}

export async function getHealth(): Promise<ApiHealthResponse & { latencyMs?: number }> {
  const start = performance.now();
  const data = await requestJson<ApiHealthResponse>(
    `${API_BASE_URL}/health`,
    { method: 'GET', cache: 'no-store' },
    TIMEOUT_HEALTH_MS,
  );
  return { ...data, latencyMs: Math.round(performance.now() - start) };
}

export async function getWorkspaces(): Promise<WorkspaceSummary[]> {
  try {
    const data = await requestJson<{ workspaces?: unknown[] }>(
      `${API_BASE_URL}/workspaces`,
      { method: 'GET', cache: 'no-store' },
      TIMEOUT_HEALTH_MS,
    );
    const list = Array.isArray(data.workspaces) ? data.workspaces : [];
    return list
      .map((item) =>
        typeof item === 'object' && item
          ? mapWorkspaceSummary(item as Record<string, unknown>)
          : null,
      )
      .filter((w): w is WorkspaceSummary => Boolean(w?.workspace_id));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function getWorkspace(workspaceId: string): Promise<WorkspaceDetail> {
  const data = await requestJson<Record<string, unknown>>(
    `${API_BASE_URL}/workspaces/${encodeURIComponent(workspaceId)}`,
    { method: 'GET', cache: 'no-store' },
    TIMEOUT_HEALTH_MS,
  );
  const base = mapWorkspaceSummary(data);
  const documents = Array.isArray(data.documents)
    ? (data.documents as Record<string, unknown>[]).map((d) => ({
        document_id: String(d.document_id ?? ''),
        filename: String(d.filename ?? 'document.pdf'),
        pages: typeof d.pages === 'number' ? d.pages : undefined,
        chunks: typeof d.chunks === 'number' ? d.chunks : undefined,
        status: normalizeWorkspaceStatus(d.status),
      }))
    : [];
  return {
    ...base,
    documents,
    embedding_model:
      typeof data.embedding_model === 'string' ? data.embedding_model : undefined,
    vector_store: typeof data.vector_store === 'string' ? data.vector_store : undefined,
    llm_model: typeof data.llm_model === 'string' ? data.llm_model : undefined,
    source: typeof data.source === 'string' ? data.source : undefined,
  };
}

export async function uploadWorkspace(
  files: File[],
  signal?: AbortSignal,
): Promise<WorkspaceUploadResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  try {
    const data = await requestJson<Record<string, unknown>>(
      `${API_BASE_URL}/workspaces/upload`,
      { method: 'POST', body: formData, signal },
      TIMEOUT_UPLOAD_MS,
    );
    const summary = mapWorkspaceSummary(data);
    const documents = Array.isArray(data.documents)
      ? (data.documents as Record<string, unknown>[]).map((d) => ({
          document_id: String(d.document_id ?? ''),
          filename: String(d.filename ?? 'document.pdf'),
          pages: typeof d.pages === 'number' ? d.pages : undefined,
          chunks: typeof d.chunks === 'number' ? d.chunks : undefined,
          status: normalizeWorkspaceStatus(d.status),
        }))
      : [];
    return {
      ...summary,
      document_count: summary.document_count || documents.length,
      total_pages: Number(data.total_pages ?? 0),
      total_chunks: Number(data.total_chunks ?? 0),
      documents,
      message:
        typeof data.message === 'string'
          ? data.message
          : 'Workspace uploaded and indexed successfully',
    };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
      throw new ApiError(
        'Workspace upload endpoint is not enabled on the API yet.',
        error.status,
      );
    }
    throw error;
  }
}

export async function askWorkspace(
  question: string,
  workspaceId: string,
): Promise<AskQuestionResult> {
  const start = performance.now();
  try {
    const data = await requestJson<Record<string, unknown>>(
      `${API_BASE_URL}/ask`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: workspaceId, question }),
      },
      TIMEOUT_ASK_MS,
    );

    const latencyMs =
      typeof data.latency_ms === 'number'
        ? data.latency_ms
        : Math.round(performance.now() - start);

    const parsedSources = parseSourcesFromResponse(
      (data.sources as unknown[]) ?? [],
      workspaceId,
    );

    return {
      answer: String(data.answer ?? ''),
      workspace_id: String(data.workspace_id ?? workspaceId),
      sources: parsedSources,
      citations: parsedSources.map((s) => {
        if (s.filename) return s.filename;
        if (s.page != null) return `Page ${s.page}`;
        if (s.chunkId != null) return `Chunk ${s.chunkId}`;
        return 'Source';
      }),
      confidence: formatConfidence(data.confidence),
      confidence_reason:
        typeof data.confidence_reason === 'string' ? data.confidence_reason : null,
      retrievalUsed: Boolean(data.retrieval_used),
      latency: `${latencyMs}ms`,
      latencyMs,
      model: typeof data.model === 'string' ? data.model : null,
      metadata:
        data.metadata && typeof data.metadata === 'object'
          ? (data.metadata as Record<string, unknown>)
          : null,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      const msg = error.message.toLowerCase();
      if (msg.includes('workspace') || msg.includes('upload')) {
        throw new ApiError('Upload a workspace first.', 400);
      }
    }
    throw error;
  }
}

export async function deleteWorkspaceDocument(
  workspaceId: string,
  documentId: string,
): Promise<void> {
  try {
    await requestJson(
      `${API_BASE_URL}/workspaces/${encodeURIComponent(workspaceId)}/documents/${encodeURIComponent(documentId)}`,
      { method: 'DELETE' },
      TIMEOUT_HEALTH_MS,
    );
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
      throw new ApiError(
        'Remover documento ainda não está disponível nesta API.',
        error.status,
      );
    }
    throw error;
  }
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  try {
    await requestJson(
      `${API_BASE_URL}/workspaces/${encodeURIComponent(workspaceId)}`,
      { method: 'DELETE' },
      TIMEOUT_HEALTH_MS,
    );
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
      throw new ApiError('Delete workspace is not enabled on the API yet.', error.status);
    }
    throw error;
  }
}

export async function clearAllWorkspaces(): Promise<void> {
  await requestJson(`${API_BASE_URL}/clear`, { method: 'DELETE' }, TIMEOUT_HEALTH_MS);
}

export type { Source };
