import { useEffect, useState } from 'react';

const FILL_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const FILL_DURATION_MS = 800;

export default function ConfidenceMeterFill({ percent }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(0);
    const frame = requestAnimationFrame(() => {
      setWidth(percent);
    });
    return () => cancelAnimationFrame(frame);
  }, [percent]);

  return (
    <div
      className="intel-confidence__meter-fill"
      style={{
        width: `${width}%`,
        transition: `width ${FILL_DURATION_MS}ms ${FILL_EASING}`,
      }}
    />
  );
}
