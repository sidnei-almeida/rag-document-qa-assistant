import { useEffect, useRef } from 'react';
import { parseMetricNumber } from '../lib/parseMetricNumber';

const DURATION_MS = 600;

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * Animates a numeric value on a DOM text node (600ms ease-out).
 * Non-numeric values are written once without animation.
 */
export function useCountUp(
  value: string | number,
  ref: React.RefObject<HTMLElement | null>,
): void {
  const previousNumeric = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const target = parseMetricNumber(value);
    if (target == null) {
      el.textContent = String(value);
      previousNumeric.current = null;
      return;
    }

    const from = previousNumeric.current ?? 0;
    previousNumeric.current = target;

    if (from === target) {
      el.textContent = String(target);
      return;
    }

    el.textContent = String(from);

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION_MS, 1);
      const current = Math.round(from + (target - from) * easeOutCubic(progress));
      el.textContent = String(current);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ref]);
}
