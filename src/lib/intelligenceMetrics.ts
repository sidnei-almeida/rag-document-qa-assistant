import { confidenceTone, formatConfidenceDisplay } from './confidenceDisplay';

export type MetricTone = 'neutral' | 'warning' | 'success' | 'medium' | 'low';

export interface WorkspaceMetricsView {
  docCount: string;
  chunks: string;
  latencyMs: number | null;
  latencyTone: MetricTone;
  confidence: string;
  confidenceTone: MetricTone;
  confidenceMeterPercent: number;
}

export function latencyTone(ms: number | null | undefined): MetricTone {
  if (ms == null || Number.isNaN(ms)) return 'neutral';
  if (ms >= 2500) return 'warning';
  if (ms >= 1200) return 'warning';
  return 'neutral';
}

function confidenceToMetricTone(
  tone: ReturnType<typeof confidenceTone>,
): MetricTone {
  if (tone === 'high') return 'success';
  if (tone === 'medium') return 'medium';
  if (tone === 'low') return 'low';
  return 'neutral';
}

export function confidenceMeterPercent(
  tone: ReturnType<typeof confidenceTone>,
): number {
  if (tone === 'high') return 82;
  if (tone === 'medium') return 55;
  if (tone === 'low') return 28;
  return 0;
}

export function buildWorkspaceMetricsView({
  docCount,
  chunks,
  lastLatencyMs,
  lastConfidence,
}: {
  docCount: number | string;
  chunks: number | string;
  lastLatencyMs?: number;
  lastConfidence?: string | null;
}): WorkspaceMetricsView {
  const rawConfTone = confidenceTone(lastConfidence);
  const confMetricTone = confidenceToMetricTone(rawConfTone);

  return {
    docCount: String(docCount),
    chunks: String(chunks),
    latencyMs: lastLatencyMs != null ? lastLatencyMs : null,
    latencyTone: latencyTone(lastLatencyMs),
    confidence: formatConfidenceDisplay(lastConfidence),
    confidenceTone: confMetricTone,
    confidenceMeterPercent: confidenceMeterPercent(rawConfTone),
  };
}
