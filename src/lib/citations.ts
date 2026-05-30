export interface GroupedCitation {
  label: string;
  count: number;
}

export interface CitationChipDisplay {
  key: string;
  label: string;
}

export interface EvidenceChipDisplay {
  key: string;
  tag: string;
  value: string;
}

const MAX_VISIBLE_SOURCES = 2;

/** Aggregate duplicate source labels (e.g. same PDF cited 6× → one chip). */
export function groupCitations(citations: string[]): GroupedCitation[] {
  const counts = new Map<string, number>();

  for (const raw of citations) {
    const label = raw?.trim();
    if (!label) continue;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
}

/** First N unique sources; remainder as "+ K fontes". */
export function formatCitationChips(citations: string[]): {
  chips: CitationChipDisplay[];
  overflowLabel: string | null;
} {
  const grouped = groupCitations(citations);
  if (grouped.length === 0) {
    return { chips: [], overflowLabel: null };
  }

  const chips: CitationChipDisplay[] = grouped.slice(0, MAX_VISIBLE_SOURCES).map((g) => ({
    key: g.label,
    label: g.count > 1 ? `${g.label} ×${g.count}` : g.label,
  }));

  const hidden = grouped.length - MAX_VISIBLE_SOURCES;
  const overflowLabel =
    hidden > 0 ? `+ ${hidden} fonte${hidden === 1 ? '' : 's'}` : null;

  return { chips, overflowLabel };
}

function parseEvidenceLabel(label: string): { tag: string; value: string } {
  const trimmed = label.trim();
  const pageMatch = /^page\s+(\d+)$/i.exec(trimmed);
  if (pageMatch) return { tag: 'Source', value: `p. ${pageMatch[1]}` };
  const chunkMatch = /^chunk\s+(\d+)$/i.exec(trimmed);
  if (chunkMatch) return { tag: 'Source', value: `chunk ${chunkMatch[1]}` };
  const countMatch = /^(.+?)\s+×(\d+)$/.exec(trimmed);
  if (countMatch) return { tag: 'Source', value: `${countMatch[1]} · ×${countMatch[2]}` };
  return { tag: 'Source', value: trimmed };
}

export function formatEvidenceChips(citations: string[]): {
  chips: EvidenceChipDisplay[];
  overflowLabel: string | null;
} {
  const { chips, overflowLabel } = formatCitationChips(citations);
  return {
    chips: chips.map((c) => {
      const { tag, value } = parseEvidenceLabel(c.label);
      return { key: c.key, tag, value };
    }),
    overflowLabel: overflowLabel?.replace(/fontes/g, 'sources'),
  };
}
