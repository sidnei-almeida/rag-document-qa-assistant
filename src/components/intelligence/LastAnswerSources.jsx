import { useMemo } from 'react';
import { groupEvidenceSources } from '../../lib/groupEvidenceSources';

export default function LastAnswerSources({ sources }) {
  const grouped = useMemo(() => groupEvidenceSources(sources ?? []), [sources]);

  const listKey = useMemo(
    () => grouped.map((row) => `${row.id}:${row.count}`).join('|'),
    [grouped],
  );

  if (!grouped.length) {
    return (
      <p className="panel-empty panel-empty--muted">
        Ask a question to see retrieved evidence from this workspace.
      </p>
    );
  }

  return (
    <ul
      key={listKey}
      className="intel-evidence-list"
      role="list"
      aria-label="Retrieved evidence"
    >
      {grouped.map((row, index) => (
        <li
          key={row.id}
          className="intel-evidence-item"
          role="listitem"
          style={{ '--evidence-stagger': `${index * 40}ms` }}
          title={
            row.count > 1
              ? `${row.filename} · p. ${row.page ?? row.chunkId} (${row.count} hits)`
              : `${row.filename}${row.page != null ? ` · p. ${row.page}` : ''}`
          }
        >
          <span className="intel-evidence-item__accent" aria-hidden />
          <span className="intel-evidence-item__filename">{row.filename}</span>
          <span className="intel-evidence-item__badges">
            {row.count > 1 && (
              <span className="intel-evidence-item__count" aria-label={`${row.count} references`}>
                ×{row.count}
              </span>
            )}
            {row.page != null ? (
              <span className="intel-evidence-item__page">p. {row.page}</span>
            ) : row.chunkId != null ? (
              <span className="intel-evidence-item__page">chunk {row.chunkId}</span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
