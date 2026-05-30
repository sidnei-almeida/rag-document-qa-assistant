import Badge from '../ui/Badge';

function SettingRow({ label, value, badge }) {
  if (value == null || value === '') return null;
  return (
    <div className="setting-row">
      <span className="setting-row__label">{label}</span>
      {badge ? (
        <Badge variant="semantic">{value}</Badge>
      ) : (
        <span className="setting-row__value">{value}</span>
      )}
    </div>
  );
}

export default function RetrievalSettings({ apiHealth, apiStatus }) {
  const retrieval = apiHealth?.retrieval ?? apiStatus?.retrieval;
  if (!retrieval) {
    return <p className="panel-empty">Retrieval config unavailable</p>;
  }

  const mode = retrieval.type
    ? `${retrieval.type.toUpperCase()}`
  : 'Semantic';

  return (
    <div className="retrieval-settings">
      <SettingRow label="Mode" value={mode} badge />
      <SettingRow label="Top K" value={retrieval.k ?? retrieval.top_k} />
      {retrieval.fetch_k != null && <SettingRow label="Fetch K" value={retrieval.fetch_k} />}
      {retrieval.lambda != null && <SettingRow label="MMR λ" value={retrieval.lambda} />}
      <SettingRow
        label="Index Path"
        value={(apiStatus?.index_path ?? apiHealth?.index_path ?? '').replace('/app/', '') || '—'}
      />
    </div>
  );
}
