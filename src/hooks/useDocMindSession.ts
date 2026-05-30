import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  clearIndex,
  getRoot,
  getStatus,
  uploadPdf as apiUploadPdf,
} from '../lib/api';
import { MAX_UPLOAD_BYTES, formatFileSize } from '../lib/documents';
import {
  clearSessionStorage,
  loadSession,
  saveSession,
  type PersistedSession,
} from '../lib/session';
import type { ChatMessage, CurrentDocument, Source, UploadState } from '../lib/types';

const INITIAL_UPLOAD: UploadState = { status: 'idle' };

const UPLOAD_STEPS = [
  'Uploading document…',
  'Extracting text…',
  'Creating embeddings…',
  'Building index…',
];

function statusFromApi(
  filename: string,
  pages?: number,
  chunks?: number,
  indexReady = true,
): CurrentDocument {
  return {
    filename,
    name: filename,
    pages,
    chunks,
    status: indexReady ? 'ready' : 'processing',
    indexReady,
    isAskEnabled: indexReady,
  };
}

function documentFromStatusResponse(status: {
  file_name?: string;
  filename?: string;
  pages?: number;
  chunks?: number;
  index_ready?: boolean;
  document_loaded?: boolean;
}): CurrentDocument | null {
  const name = status.filename ?? status.file_name;
  if (!name && !status.document_loaded && !status.index_ready) return null;
  const ready = Boolean(status.index_ready ?? status.document_loaded);
  return statusFromApi(name || 'document.pdf', status.pages, status.chunks, ready);
}

export function useDocMindSession() {
  const persisted = loadSession();

  const [currentDocument, setCurrentDocument] = useState<CurrentDocument | null>(
    () => persisted.currentDocument,
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() => persisted.messages);
  const [lastSources, setLastSources] = useState<Source[]>(() => persisted.lastSources);
  const [lastConfidence, setLastConfidence] = useState<string | undefined>(
    () => persisted.lastConfidence,
  );
  const [lastLatencyMs, setLastLatencyMs] = useState<number | undefined>(
    () => persisted.lastLatencyMs,
  );
  const [uploadState, setUploadState] = useState<UploadState>(INITIAL_UPLOAD);
  const [indexReady, setIndexReady] = useState(false);

  const persist = useCallback(
    (patch: Partial<PersistedSession>) => {
      const next: PersistedSession = {
        currentDocument: patch.currentDocument ?? currentDocument,
        messages: patch.messages ?? messages,
        lastSources: patch.lastSources ?? lastSources,
        lastConfidence: patch.lastConfidence ?? lastConfidence,
        lastLatencyMs: patch.lastLatencyMs ?? lastLatencyMs,
      };
      saveSession(next);
    },
    [currentDocument, messages, lastSources, lastConfidence, lastLatencyMs],
  );

  const syncWithApiIndex = useCallback(async () => {
    try {
      const root = await getRoot();
      const ready = Boolean(root.index_ready);
      setIndexReady(ready);

      if (!ready) {
        setCurrentDocument(null);
        setMessages([]);
        setLastSources([]);
        setLastConfidence(undefined);
        setLastLatencyMs(undefined);
        clearSessionStorage();
        return;
      }

      const status = await getStatus();
      const fromServer = documentFromStatusResponse(status);
      if (fromServer) {
        setCurrentDocument((prev) => prev ?? fromServer);
      }
    } catch {
      // keep local state on transient errors
    }
  }, []);

  useEffect(() => {
    syncWithApiIndex();
  }, [syncWithApiIndex]);

  useEffect(() => {
    saveSession({
      currentDocument,
      messages,
      lastSources,
      lastConfidence,
      lastLatencyMs,
    });
  }, [currentDocument, messages, lastSources, lastConfidence, lastLatencyMs]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateLastAnswerMetadata = useCallback(
    (payload: {
      lastSources?: Source[];
      lastConfidence?: string | null;
      lastLatencyMs?: number;
    }) => {
      if (payload.lastSources !== undefined) setLastSources(payload.lastSources);
      if (payload.lastConfidence !== undefined) {
        setLastConfidence(payload.lastConfidence ?? undefined);
      }
      if (payload.lastLatencyMs !== undefined) setLastLatencyMs(payload.lastLatencyMs);
    },
    [],
  );

  const uploadPdf = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        setUploadState({
          status: 'error',
          error: 'Only PDF files are supported right now.',
          filename: file.name,
        });
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setUploadState({
          status: 'error',
          error: `File is too large. Maximum size is ${formatFileSize(MAX_UPLOAD_BYTES)}.`,
          filename: file.name,
        });
        return;
      }

      const timers: ReturnType<typeof setTimeout>[] = [];
      setUploadState({
        status: 'uploading',
        progressLabel: UPLOAD_STEPS[0],
        filename: file.name,
      });
      UPLOAD_STEPS.forEach((label, i) => {
        timers.push(
          setTimeout(() => {
            setUploadState((s) =>
              s.status === 'uploading' ? { ...s, progressLabel: label } : s,
            );
          }, i * 1400),
        );
      });

      try {
        const result = await apiUploadPdf(file);
        timers.forEach(clearTimeout);

        const doc = statusFromApi(
          result.filename,
          result.pages,
          result.chunks,
          result.indexReady,
        );
        setCurrentDocument(doc);
        setIndexReady(true);
        setMessages([]);
        setLastSources([]);
        setLastConfidence(undefined);
        setLastLatencyMs(undefined);

        setUploadState({
          status: 'success',
          progressLabel: 'Document ready',
          filename: result.filename,
        });
        setTimeout(() => {
          setUploadState((s) => (s.status === 'success' ? { status: 'idle' } : s));
        }, 3000);
      } catch (err) {
        timers.forEach(clearTimeout);
        const message =
          err instanceof Error ? err.message : 'Upload failed. Please try again.';
        setUploadState({
          status: 'error',
          error: message,
          filename: file.name,
        });
      }
    },
    [],
  );

  const resetDocument = useCallback(async () => {
    try {
      await clearIndex();
    } catch {
      // still clear local UI if API fails
    }
    setCurrentDocument(null);
    setMessages([]);
    setLastSources([]);
    setLastConfidence(undefined);
    setLastLatencyMs(undefined);
    clearSessionStorage();
    setUploadState({ status: 'idle' });
    await syncWithApiIndex();
  }, [syncWithApiIndex]);

  const setUploadDragging = useCallback((dragging: boolean) => {
    setUploadState((prev) => {
      if (prev.status === 'uploading') return prev;
      return dragging ? { status: 'dragging' } : { status: 'idle' };
    });
  }, []);

  const isUploading = uploadState.status === 'uploading';

  return {
    currentDocument,
    messages,
    lastSources,
    lastConfidence,
    lastLatencyMs,
    uploadState,
    isUploading,
    indexReady,
    addMessage,
    updateLastAnswerMetadata,
    uploadPdf,
    resetDocument,
    setUploadDragging,
    syncWithApiIndex,
  };
}
