import CitationChip from './CitationChip';
import { formatEvidenceChips } from '../../lib/citations';

export default function CitationList({ citations }) {
  const { chips, overflowLabel } = formatEvidenceChips(citations ?? []);

  if (chips.length === 0 && !overflowLabel) return null;

  return (
    <div className="evidence-block" role="list" aria-label="Retrieved evidence">
      <span className="evidence-block__label">Retrieved evidence</span>
      <div className="evidence-block__chips">
        {chips.map((chip) => (
          <CitationChip key={chip.key} value={chip.value} />
        ))}
        {overflowLabel && (
          <span className="evidence-chip evidence-chip--overflow">{overflowLabel}</span>
        )}
      </div>
    </div>
  );
}
