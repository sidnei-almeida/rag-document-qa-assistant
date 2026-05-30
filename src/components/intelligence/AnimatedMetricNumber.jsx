import { useRef } from 'react';
import clsx from 'clsx';
import { useCountUp } from '../../hooks/useCountUp';
import { parseMetricNumber } from '../../lib/parseMetricNumber';

export default function AnimatedMetricNumber({ value, className }) {
  const ref = useRef(null);
  const isNumeric = parseMetricNumber(value) != null;

  useCountUp(value, ref);

  if (!isNumeric) {
    return <span className={clsx(className)}>{value}</span>;
  }

  return (
    <span ref={ref} className={clsx(className)}>
      {String(parseMetricNumber(value))}
    </span>
  );
}
