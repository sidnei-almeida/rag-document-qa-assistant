import { useMemo } from 'react';
import clsx from 'clsx';
import { buildWorkspaceMetricsView } from '../../lib/intelligenceMetrics';
import AnimatedMetricNumber from './AnimatedMetricNumber';
import ConfidenceMeterFill from './ConfidenceMeterFill';

function InlineStat({ label, value }) {
  return (
    <div className="intel-inline-stat">
      <span className="intel-metric__label">{label}</span>
      <AnimatedMetricNumber value={value} className="intel-inline-stat__value" />
    </div>
  );
}

export default function IntelligenceMetricsGrid({
  docCount,
  chunks,
  lastLatencyMs,
  lastConfidence,
}) {
  const metrics = useMemo(
    () =>
      buildWorkspaceMetricsView({
        docCount,
        chunks,
        lastLatencyMs,
        lastConfidence,
      }),
    [docCount, chunks, lastLatencyMs, lastConfidence],
  );

  const hasLatency = metrics.latencyMs != null;
  const hasConfidence = metrics.confidence !== '—';

  return (
    <section className="intel-metrics" aria-label="Workspace metrics">
      <div className="intel-metrics__row intel-metrics__row--pair">
        <InlineStat label="Docs" value={metrics.docCount} />
        <div className="intel-metrics__vdivider" aria-hidden />
        <InlineStat label="Chunks" value={metrics.chunks} />
      </div>

      <div
        className={clsx(
          'intel-metrics__row',
          'intel-metrics__row--latency',
          `intel-metrics__row--tone-${metrics.latencyTone}`,
        )}
      >
        <span className="intel-metric__label">Latency</span>
        <div className="intel-latency">
          {hasLatency && (
            <span className="intel-latency__pulse" aria-hidden title="Live" />
          )}
          {hasLatency ? (
            <p className="intel-latency__value">
              <AnimatedMetricNumber
                value={metrics.latencyMs}
                className="intel-latency__number"
              />
              <sup className="intel-latency__unit">ms</sup>
            </p>
          ) : (
            <span className="intel-latency__empty">—</span>
          )}
        </div>
      </div>

      <div
        className={clsx(
          'intel-metrics__row',
          'intel-metrics__row--confidence',
          `intel-metrics__row--tone-${metrics.confidenceTone}`,
        )}
      >
        <span className="intel-metric__label">Confidence</span>
        <div className="intel-confidence">
          <div className="intel-confidence__main">
            <span className="intel-confidence__accent" aria-hidden />
            {hasConfidence ? (
              <span className="intel-confidence__value" role="status">
                {metrics.confidence}
              </span>
            ) : (
              <span className="intel-confidence__value intel-confidence__value--empty">—</span>
            )}
          </div>
          {hasConfidence && (
            <div
              className="intel-confidence__meter"
              role="meter"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={metrics.confidenceMeterPercent}
              aria-label={`Confidence level: ${metrics.confidence}`}
            >
              <ConfidenceMeterFill percent={metrics.confidenceMeterPercent} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
