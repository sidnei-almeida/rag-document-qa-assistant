import { formatLastChecked } from '../../utils/formatters';
import {
  formatEmbeddingModel,
  formatLlmDisplayName,
} from '../../utils/apiMappers';
import Badge from '../ui/Badge';

function MetaRow({ label, value, children }) {
  if (!children && (value == null || value === '')) return null;
  return (
    <div className="meta-row">
      <span className="meta-row__label">{label}</span>
      {children ?? <span className="meta-row__value">{value}</span>}
    </div>
  );
}

function ReadyBadge({ ready }) {
  return (
    <Badge variant={ready ? 'ready' : 'processing'}>
      {ready ? 'Yes' : 'No'}
    </Badge>
  );
}

const STATUS_LABELS = {
  ready: 'Ready',
  processing: 'Processing',
  missing: 'Missing',
  error: 'Error',
};

export default function DocumentMetadata({
  document,
  apiHealth,
  apiStatus,
  apiLatency,
  lastCheckedAt,
}) {
  if (!document) {
    return <p className="panel-empty">No document selected</p>;
  }

  const health = apiHealth ?? apiStatus ?? {};
  const status = apiStatus ?? {};
  const embeddingModel =
    status.embedding_model ?? health.embedding_model ?? '—';

  return (
    <div className="document-metadata">
      <MetaRow label="File" value={document.filename ?? document.name} />
      <MetaRow label="Pages" value={document.pages} />
      <MetaRow label="Chunks" value={document.chunks} />
      <MetaRow label="Status" value={STATUS_LABELS[document.status] ?? document.status} />
      <MetaRow label="Source" value={SOURCE_LABELS[document.source] ?? document.source} />
      <MetaRow label="Index Ready">
        <ReadyBadge ready={document.indexReady} />
      </MetaRow>
      <MetaRow label="Vector Store" value="FAISS" />
      <MetaRow
        label="LLM"
        value={formatLlmDisplayName(status.model ?? health.model)}
      />
      <MetaRow label="Provider" value="Groq" />
      <MetaRow label="Embeddings" value={formatEmbeddingModel(embeddingModel)} />
      <MetaRow label="API Latency" value={apiLatency ?? '—'} />
      <MetaRow label="Last Checked" value={formatLastChecked(lastCheckedAt)} />
    </div>
  );
}
