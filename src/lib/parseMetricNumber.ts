/** Parse display metric strings for count-up animation. */
export function parseMetricNumber(value: string | number | null | undefined): number | null {
  if (value == null || value === '' || value === '—') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const normalized = String(value).replace(/,/g, '').trim();
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}
