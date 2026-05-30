import { DOCUMENT_STATUS } from './constants';

export const SAMPLE_DOCUMENT_ID = 'sample-ai-doc';

export function formatLlmDisplayName(model) {
  if (!model) return '—';
  if (model.includes('llama-3.3-70b')) return 'Llama 3.3 70B';
  if (model.includes('llama')) return model.replace(/-/g, ' ');
  return model;
}

export function formatEmbeddingModel(name) {
  if (!name) return '—';
  return name.replace(/^sentence-transformers\//, '');
}

export function buildDocumentFromStatus(status) {
  if (!status?.file_name && !status?.document_loaded) return null;

  const ready = Boolean(status.index_ready && status.document_loaded);

  return {
    id: SAMPLE_DOCUMENT_ID,
    fileName: status.file_name || 'ai-document-intelligence-report.pdf',
    status: ready ? DOCUMENT_STATUS.INDEXED : DOCUMENT_STATUS.PROCESSING,
    pages: status.pages ?? '—',
    chunks: status.chunks ?? '—',
    embeddingModel: status.embedding_model,
    retrieval: status.retrieval,
  };
}

export function buildDocumentsList(status) {
  const doc = buildDocumentFromStatus(status);
  return doc ? [doc] : [];
}
