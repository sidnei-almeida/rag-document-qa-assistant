import type {
  ApiDocumentSummary,
  DocumentItem,
  DocumentSource,
  DocumentStatus,
  UploadDocumentResult,
} from './types';

/** Legacy frontend id — migrated to API sample id on load. */
export const LEGACY_SAMPLE_DOCUMENT_ID = 'sample';

/** API default sample document id. */
export const SAMPLE_DOCUMENT_ID = 'sample-ai-document-intelligence-report';

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export function migrateDocumentId(id: string): string {
  if (id === LEGACY_SAMPLE_DOCUMENT_ID) return SAMPLE_DOCUMENT_ID;
  return id;
}

function mapStatus(status: string | undefined, indexReady: boolean): DocumentStatus {
  if (status === 'ready' && indexReady) return 'ready';
  if (status === 'processing') return 'processing';
  if (status === 'error') return 'error';
  if (status === 'missing') return 'missing';
  if (status === 'ready' && !indexReady) return 'processing';
  return 'missing';
}

function inferSource(doc: ApiDocumentSummary, sourceOverride?: DocumentSource): DocumentSource {
  if (sourceOverride) return sourceOverride;
  if (doc.is_default || doc.document_id === SAMPLE_DOCUMENT_ID) return 'sample';
  return 'upload';
}

export function normalizeDocumentFromApi(
  doc: ApiDocumentSummary,
  sourceOverride?: DocumentSource,
): DocumentItem {
  const document_id = doc.document_id;
  const indexReady = Boolean(doc.index_ready ?? doc.status === 'ready');
  const status = mapStatus(doc.status, indexReady);
  const isAskEnabled = status === 'ready' && indexReady;

  return {
    id: document_id,
    document_id,
    name: doc.filename,
    filename: doc.filename,
    status,
    indexReady,
    pages: doc.pages,
    chunks: doc.chunks,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
    isDefault: Boolean(doc.is_default),
    source: inferSource(doc, sourceOverride),
    isAskEnabled,
  };
}

export function normalizeDocumentFromUpload(result: UploadDocumentResult): DocumentItem {
  const indexReady = Boolean(result.index_ready ?? result.status === 'ready');
  const status = mapStatus(result.status, indexReady);

  return {
    id: result.document_id,
    document_id: result.document_id,
    name: result.filename,
    filename: result.filename,
    status,
    indexReady,
    pages: result.pages,
    chunks: result.chunks,
    source: 'upload',
    isAskEnabled: status === 'ready' && indexReady,
  };
}

export function normalizeDocumentList(
  apiDocs: ApiDocumentSummary[] | undefined,
): DocumentItem[] {
  if (!apiDocs?.length) return [];
  return apiDocs.map((d) => normalizeDocumentFromApi(d));
}

/** Keep only documents the user has in their workspace (upload / optional sample). */
export function filterWorkspaceDocuments(
  documents: DocumentItem[],
  workspaceIds: Set<string>,
): DocumentItem[] {
  if (!workspaceIds.size) return [];
  return documents.filter((d) => workspaceIds.has(d.id));
}

export function pickDefaultDocumentId(
  documents: DocumentItem[],
  preferredId?: string | null,
): string | null {
  if (preferredId) {
    const migrated = migrateDocumentId(preferredId);
    const found = documents.find((d) => d.id === migrated && d.isAskEnabled);
    if (found) return found.id;
  }

  return documents.find((d) => d.isAskEnabled)?.id ?? documents[0]?.id ?? null;
}

export function countConversationMessages(
  messages: { role: string }[] | undefined,
): number {
  if (!messages?.length) return 0;
  return messages.filter((m) => m.role === 'user' || m.role === 'assistant').length;
}

export function canDeleteDocument(doc: DocumentItem | null | undefined): boolean {
  if (!doc) return false;
  if (doc.source === 'sample' && doc.isDefault) return false;
  return doc.source === 'upload' || doc.source === 'sample';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
