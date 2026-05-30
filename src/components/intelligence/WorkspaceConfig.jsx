import {
  formatEmbeddingModel,
  formatLlmDisplayName,
} from '../../utils/apiMappers';

function ConfigRow({ label, value, accent }) {
  if (value == null || value === '') return null;

  return (
    <div className="intel-config-row">
      <span className="intel-config-row__label">{label}</span>
      <span className={`intel-config-row__value intel-config-row__value--${accent}`}>
        <span className="intel-config-row__dot" aria-hidden />
        <span className="intel-config-row__text">{value}</span>
      </span>
    </div>
  );
}

export default function WorkspaceConfig({ workspaceDetail, apiHealth }) {
  const health = apiHealth ?? {};
  const embeddingModel =
    workspaceDetail?.embedding_model ?? health.embedding_model ?? '—';
  const llmModel =
    workspaceDetail?.llm_model ?? health.model ?? 'Llama 3.3 70B';

  const vectorStore = workspaceDetail?.vector_store ?? 'FAISS';
  const llm = formatLlmDisplayName(llmModel);
  const provider = 'Groq';
  const embeddings = formatEmbeddingModel(embeddingModel);

  return (
    <div className="intel-config-list">
      <ConfigRow label="Vector store" value={vectorStore} accent="vector" />
      <ConfigRow label="LLM" value={llm} accent="llm" />
      <ConfigRow label="Provider" value={provider} accent="provider" />
      <ConfigRow label="Embeddings" value={embeddings} accent="embedding" />
    </div>
  );
}
