import type { ChatMessage, CurrentDocument, Source } from './types';

export const SESSION_STORAGE_KEY = 'docmind:v3:session';

export interface PersistedSession {
  currentDocument: CurrentDocument | null;
  messages: ChatMessage[];
  lastSources: Source[];
  lastConfidence?: string;
  lastLatencyMs?: number;
}

const EMPTY_SESSION: PersistedSession = {
  currentDocument: null,
  messages: [],
  lastSources: [],
};

export function loadSession(): PersistedSession {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return { ...EMPTY_SESSION };
    const parsed = JSON.parse(raw) as PersistedSession;
    return {
      currentDocument: parsed.currentDocument ?? null,
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      lastSources: Array.isArray(parsed.lastSources) ? parsed.lastSources : [],
      lastConfidence: parsed.lastConfidence,
      lastLatencyMs: parsed.lastLatencyMs,
    };
  } catch {
    return { ...EMPTY_SESSION };
  }
}

export function saveSession(session: PersistedSession): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore quota errors
  }
}

export function clearSessionStorage(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}
