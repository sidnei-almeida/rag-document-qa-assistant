import clsx from 'clsx';

const VARIANTS = {
  ready: 'badge--ready',
  indexed: 'badge--indexed',
  processing: 'badge--processing',
  completed: 'badge--completed',
  error: 'badge--error',
  semantic: 'badge--semantic',
  checking: 'badge--checking',
};

export default function Badge({ variant = 'ready', children, className, dot = false }) {
  return (
    <span className={clsx('badge', VARIANTS[variant], className)}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
