import clsx from 'clsx';
import { REAL_PIPELINE_STEPS } from '../../utils/constants';

function stepReady(step, health, status, activeDocument) {
  if (step.id === 'document') {
    return Boolean(activeDocument?.indexReady && activeDocument?.isAskEnabled);
  }
  const source = step.statusOnly ? status : health;
  if (!source) return false;
  return Boolean(source[step.flag]);
}

export default function PipelineStatus({ apiHealth, apiStatus, activeDocument }) {
  const health = apiHealth ?? {};
  const status = apiStatus ?? {};

  return (
    <div className="pipeline-status">
      {REAL_PIPELINE_STEPS.map((step) => {
        const ready = stepReady(step, health, status, activeDocument);
        const state = ready ? 'completed' : 'pending';
        return (
          <div
            key={step.id}
            className={clsx('pipeline-status__item', `pipeline-status__item--${state}`)}
          >
            <span className="pipeline-status__dot" />
            <span className="pipeline-status__label">{step.label}</span>
            <span className="pipeline-status__state">{ready ? 'completed' : 'pending'}</span>
          </div>
        );
      })}
    </div>
  );
}
