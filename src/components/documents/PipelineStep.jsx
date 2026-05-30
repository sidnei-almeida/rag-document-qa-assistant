import clsx from 'clsx';
import { Check, Circle, Loader2 } from 'lucide-react';

export default function PipelineStep({ label, state = 'pending' }) {
  return (
    <div className={clsx('pipeline-step', `pipeline-step--${state}`)}>
      <span className="pipeline-step__icon" aria-hidden="true">
        {state === 'completed' && <Check size={14} strokeWidth={2.5} />}
        {state === 'active' && <Loader2 size={14} className="pipeline-step__spinner" />}
        {state === 'pending' && <Circle size={14} strokeWidth={1.5} />}
      </span>
      <span className="pipeline-step__label">{label}</span>
    </div>
  );
}
