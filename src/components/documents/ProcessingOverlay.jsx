import PipelineStep from './PipelineStep';

export default function ProcessingOverlay({ isOpen, fileName, steps }) {
  if (!isOpen) return null;

  return (
    <div className="processing-overlay" role="dialog" aria-modal="true" aria-labelledby="processing-title">
      <div className="processing-overlay__backdrop" />
      <div className="processing-overlay__panel">
        <div className="processing-overlay__header">
          <h2 id="processing-title" className="processing-overlay__title">Processing PDF</h2>
          {fileName && (
            <p className="processing-overlay__filename">{fileName}</p>
          )}
        </div>
        <p className="processing-overlay__message">
          Your document is being processed and indexed. This may take a few moments.
        </p>
        <div className="processing-overlay__steps">
          {steps.map((step) => (
            <PipelineStep key={step.id} label={step.label} state={step.state} />
          ))}
        </div>
      </div>
    </div>
  );
}
