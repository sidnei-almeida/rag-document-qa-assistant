export type WorkspaceStatus = 'ready' | 'processing' | 'error';

export interface WorkspaceSummary {
  workspace_id: string;
  title: string;
  status: WorkspaceStatus;
  index_ready: boolean;
  document_count: number;
  total_pages?: number;
  total_chunks?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkspaceDocument {
  document_id: string;
  filename: string;
  pages?: number;
  chunks?: number;
  status?: WorkspaceStatus;
}

export interface WorkspaceDetail extends WorkspaceSummary {
  documents: WorkspaceDocument[];
  embedding_model?: string;
  vector_store?: string;
  llm_model?: string;
  source?: string;
}

export interface Source {
  id: string;
  workspace_id?: string;
  document_id?: string;
  filename?: string;
  fileName?: string | null;
  page?: number | null;
  chunk_id?: string;
  chunkId?: string | number | null;
  score?: number | null;
  preview?: string | null;
  text?: string;
  section?: string | null;
}

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  workspaceId: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  sources?: Source[];
  citations?: string[];
  confidence?: string;
  latencyMs?: number;
  retrievalUsed?: boolean;
  error?: string;
}

export interface WorkspaceConversation {
  workspaceId: string;
  messages: ChatMessage[];
  lastSources: Source[];
  lastConfidence?: string;
  lastLatencyMs?: number;
  updatedAt?: string;
}

export type UploadStatus = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';

export interface UploadState {
  status: UploadStatus;
  filename?: string;
  progressLabel?: string;
  error?: string;
}

export interface PersistedWorkspaceState {
  version: 3;
  activeWorkspaceId: string;
  conversations: Record<string, WorkspaceConversation>;
}

export interface WorkspaceUploadResponse {
  workspace_id: string;
  title: string;
  status: WorkspaceStatus;
  index_ready: boolean;
  document_count: number;
  total_pages: number;
  total_chunks: number;
  documents: WorkspaceDocument[];
  message?: string;
}

export interface ApiHealthResponse {
  status?: string;
  api_ready?: boolean;
  llm_ready?: boolean;
  embeddings_ready?: boolean;
  storage_ready?: boolean;
  documents_ready?: boolean;
  index_ready?: boolean;
  workspace_count?: number;
  default_workspace_id?: string | null;
  model?: string;
  embedding_model?: string;
  retrieval?: Record<string, unknown>;
  limits?: Record<string, unknown>;
}

export interface AskQuestionResult {
  answer: string;
  workspace_id: string;
  sources: Source[];
  citations: string[];
  confidence: string | null;
  confidence_reason?: string | null;
  retrievalUsed: boolean;
  latency: string;
  latencyMs: number;
  model: string | null;
  metadata?: Record<string, unknown> | null;
}
