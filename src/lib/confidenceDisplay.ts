/** Semantic tone for confidence stat card (high / medium / low). */
export function confidenceTone(
  value: string | null | undefined,
): 'high' | 'medium' | 'low' | 'neutral' {
  if (value == null || value === '' || value === '—') return 'neutral';
  const normalized = String(value).toLowerCase().trim();
  if (normalized.includes('high') || normalized.includes('alta')) return 'high';
  if (normalized.includes('low') || normalized.includes('baixa')) return 'low';
  if (normalized.includes('medium') || normalized.includes('média') || normalized.includes('media')) {
    return 'medium';
  }
  return 'neutral';
}

export function formatConfidenceDisplay(value: string | null | undefined): string {
  if (value == null || value === '') return '—';
  const raw = String(value).trim();
  if (raw.length <= 1) return raw.toUpperCase();
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}
