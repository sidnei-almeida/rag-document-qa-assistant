import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { API_BASE_URL } from '../lib/env';

const STATUS_MESSAGES = [
  'Connecting to API...',
  'Initializing workspace...',
  'Almost ready...',
];

const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 15000;
const READY_HOLD_MS = 400;
const FADE_OUT_MS = 600;

export default function LoadingScreen({ onReady, apiHealthUrl = `${API_BASE_URL}/health` }) {
  const [phase, setPhase] = useState('connecting');
  const [fading, setFading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [pollSession, setPollSession] = useState(0);

  const handleRetry = useCallback(() => {
    setFading(false);
    setMessageIndex(0);
    setPhase('connecting');
    setPollSession((session) => session + 1);
  }, []);

  useEffect(() => {
    if (phase !== 'connecting') return undefined;

    let cancelled = false;
    const pollTimer = setInterval(() => {
      void probe();
    }, POLL_INTERVAL_MS);

    const timeoutTimer = setTimeout(() => {
      if (cancelled) return;
      clearInterval(pollTimer);
      setPhase('error');
    }, TIMEOUT_MS);

    async function probe() {
      if (cancelled) return;
      try {
        const response = await fetch(apiHealthUrl, { method: 'GET', cache: 'no-store' });
        if (cancelled) return;
        if (response.status === 200) {
          clearInterval(pollTimer);
          clearTimeout(timeoutTimer);
          setPhase('ready');
        }
      } catch {
        /* keep polling until timeout */
      }
    }

    void probe();

    return () => {
      cancelled = true;
      clearInterval(pollTimer);
      clearTimeout(timeoutTimer);
    };
  }, [apiHealthUrl, phase, pollSession]);

  useEffect(() => {
    if (phase !== 'connecting') return undefined;

    const id = setInterval(() => {
      setMessageIndex((index) => (index + 1) % STATUS_MESSAGES.length);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(id);
  }, [phase, pollSession]);

  useEffect(() => {
    if (phase !== 'ready') return undefined;

    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, READY_HOLD_MS);

    const doneTimer = setTimeout(() => {
      onReady();
    }, READY_HOLD_MS + FADE_OUT_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [phase, onReady]);

  return (
    <div
      className={clsx('loading-screen', fading && 'loading-screen--fade-out')}
      role="status"
      aria-live="polite"
      aria-busy={phase !== 'error'}
    >
      <div className="loading-screen__content">
        <div className="loading-screen__brand">
          <span className="loading-screen__logo-mark" aria-hidden />
          <span className="loading-screen__name">DocMind</span>
        </div>

        <div className="loading-screen__status">
          {phase === 'connecting' && (
            <>
              <div className="loading-screen__dots" aria-hidden>
                <span />
                <span />
                <span />
              </div>
              <p className="loading-screen__status-text">
                {STATUS_MESSAGES[messageIndex]}
              </p>
            </>
          )}

          {phase === 'ready' && (
            <div className="loading-screen__ready">
              <span className="loading-screen__ready-dot" aria-hidden />
              <span className="loading-screen__ready-text">Ready</span>
            </div>
          )}

          {phase === 'error' && (
            <>
              <i className="ti ti-wifi-off loading-screen__error-icon" aria-hidden />
              <p className="loading-screen__status-text loading-screen__status-text--error">
                Unable to reach API
              </p>
              <button type="button" className="loading-screen__retry" onClick={handleRetry}>
                Retry
              </button>
            </>
          )}
        </div>
      </div>

      <p className="loading-screen__footer">Live HF Space</p>
    </div>
  );
}
