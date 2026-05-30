import { useRef, useState, useCallback, useEffect } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import clsx from 'clsx';

const MIN_HEIGHT = 52;
const MAX_HEIGHT = 160;

export default function MessageComposer({
  onSend,
  disabled = false,
  loading = false,
  placeholder = 'Ask a question about this workspace...',
}) {
  const textareaRef = useRef(null);
  const [value, setValue] = useState('');

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(Math.max(el.scrollHeight, MIN_HEIGHT), MAX_HEIGHT);
    el.style.height = `${next}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [value, resizeTextarea]);

  const hasText = value.trim().length > 0;
  const canSend = hasText && !disabled && !loading;
  const showSend = hasText || loading;

  const handleSend = () => {
    const text = value.trim();
    if (!text || !canSend) return;
    onSend(text);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = `${MIN_HEIGHT}px`;
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-composer">
      <div className="message-composer__wrap">
        <div className="message-composer__field">
          <textarea
            ref={textareaRef}
            className="message-composer__input"
            placeholder={placeholder}
            rows={1}
            value={value}
            disabled={disabled || loading}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Message input"
          />
          <button
            type="button"
            className={clsx(
              'message-composer__send',
              !showSend && 'message-composer__send--hidden',
              showSend && 'message-composer__send--active',
              loading && 'message-composer__send--loading',
            )}
            onClick={handleSend}
            disabled={!canSend}
            aria-label={loading ? 'Sending message' : 'Send message'}
            aria-hidden={!showSend}
            tabIndex={showSend ? 0 : -1}
          >
            {loading ? (
              <Loader2 className="message-composer__icon message-composer__spinner" aria-hidden />
            ) : (
              <ArrowUp className="message-composer__icon" size={14} strokeWidth={2} aria-hidden />
            )}
          </button>
        </div>
        <p className="message-composer__tip">Shift+Enter for new line</p>
      </div>
    </div>
  );
}
