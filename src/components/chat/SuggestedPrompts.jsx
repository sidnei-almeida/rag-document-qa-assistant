const DEFAULT_PROMPTS = [
  'Summarize this document.',
  'What are the main benefits?',
  'What are the limitations?',
  'Which technologies are mentioned?',
];

export default function SuggestedPrompts({ onSelect, disabled, prompts = DEFAULT_PROMPTS }) {
  return (
    <div className="suggested-prompts">
      <p className="suggested-prompts__label">Suggested prompts</p>
      <div className="suggested-prompts__grid">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="suggested-prompts__card"
            disabled={disabled}
            onClick={() => onSelect(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
