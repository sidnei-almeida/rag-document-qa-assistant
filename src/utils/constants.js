export const DOCUMENT_STATUS = {
  INDEXED: 'indexed',
  PROCESSING: 'processing',
  READY: 'ready',
};

export const API_STATUS = {
  CHECKING: 'checking',
  READY: 'ready',
  ERROR: 'error',
};

export const PROCESSING_STEPS = [
  { id: 'upload', label: 'Uploading file' },
  { id: 'extract', label: 'Extracting text' },
  { id: 'embed', label: 'Creating embeddings' },
  { id: 'index', label: 'Building index' },
  { id: 'ready', label: 'Ready' },
];

export const PIPELINE_STEPS = [
  { id: 'upload', label: 'Upload' },
  { id: 'extract', label: 'Extract Text' },
  { id: 'embed', label: 'Create Embeddings' },
  { id: 'index', label: 'Build Index' },
];

export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-large';
export const DEFAULT_EMBEDDING_DIMENSION = 3072;
export const DEFAULT_RETRIEVAL_MODE = 'Semantic Search';
export const DEFAULT_TOP_K = 5;
export const DEFAULT_SCORE_THRESHOLD = 0.65;
export const DEFAULT_RERANK_MODEL = 'bge-reranker-large';

export const WELCOME_MESSAGE = {
  id: 'msg-welcome',
  role: 'assistant',
  content:
    "Hello! I'm DocMind, your document intelligence assistant. Ask questions about the loaded sample document — each answer is grounded in retrieved passages from the FAISS index, with source citations you can verify in the panel on the right.",
  citations: [],
  timestamp: new Date().toISOString(),
};

export const REAL_PIPELINE_STEPS = [
  { id: 'api', label: 'API Online', flag: 'api_ready' },
  { id: 'llm', label: 'LLM Connected', flag: 'llm_ready' },
  { id: 'index', label: 'Index Loaded', flag: 'index_ready' },
  { id: 'document', label: 'Document Active', flag: 'document_loaded', statusOnly: true },
];
