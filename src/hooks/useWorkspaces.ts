import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  ApiError,
  askWorkspace,
  deleteWorkspace as apiDeleteWorkspace,
  deleteWorkspaceDocument as apiDeleteWorkspaceDocument,
  getHealth,
  getWorkspace,
  getWorkspaces,
  uploadWorkspace,
} from '../lib/api';
import {
  countUserFacingMessages,
  createEmptyConversation,
  ensureConversation,
  updateConversationMetadata,
} from '../lib/conversations';
import {
  loadPersistedWorkspaceState,
  pruneConversationsForWorkspaces,
  savePersistedWorkspaceState,
} from '../lib/storage';
import {
  UPLOAD_PROGRESS_STEPS,
  validatePdfFiles,
} from '../lib/uploadLimits';
import { filterSourcesForWorkspace, pickDefaultWorkspaceId } from '../lib/workspaceDisplay';
import type {
  ChatMessage,
  UploadState,
  WorkspaceConversation,
  WorkspaceDetail,
  WorkspaceSummary,
} from '../lib/types';

const INITIAL_UPLOAD: UploadState = { status: 'idle' };

export function useWorkspaces() {
  const persistedRef = useRef(loadPersistedWorkspaceState());

  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [workspaceDetails, setWorkspaceDetails] = useState<Record<string, WorkspaceDetail>>({});
  const [conversations, setConversations] = useState<Record<string, WorkspaceConversation>>(
    () => persistedRef.current?.conversations ?? {},
  );
  const [uploadState, setUploadState] = useState<UploadState>(INITIAL_UPLOAD);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [workspacesError, setWorkspacesError] = useState<string | null>(null);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [deletingWorkspaceId, setDeletingWorkspaceId] = useState<string | null>(null);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);

  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeWorkspace =
    workspaces.find((w) => w.workspace_id === activeWorkspaceId) ??
    (activeWorkspaceId ? workspaceDetails[activeWorkspaceId] : null) ??
    null;

  const activeConversation = activeWorkspaceId
    ? ensureConversation(conversations, activeWorkspaceId)
    : null;

  const activeMessages = activeConversation?.messages ?? [];
  const activeLastSources = activeWorkspaceId
    ? filterSourcesForWorkspace(
        activeConversation?.lastSources ?? [],
        activeWorkspaceId,
      )
    : [];

  const schedulePersist = useCallback(
    (wsId: string | null, convs: Record<string, WorkspaceConversation>) => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
      persistTimerRef.current = setTimeout(() => {
        savePersistedWorkspaceState(wsId, convs);
      }, 200);
    },
    [],
  );

  useEffect(() => {
    schedulePersist(activeWorkspaceId, conversations);
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, [activeWorkspaceId, conversations, schedulePersist]);

  const loadWorkspaceDetail = useCallback(async (workspaceId: string) => {
    try {
      const detail = await getWorkspace(workspaceId);
      setWorkspaceDetails((prev) => ({ ...prev, [workspaceId]: detail }));
      setWorkspaces((prev) =>
        prev.map((w) => (w.workspace_id === workspaceId ? { ...w, ...detail } : w)),
      );
      return detail;
    } catch {
      return null;
    }
  }, []);

  const refreshWorkspaces = useCallback(async () => {
    setWorkspacesError(null);
    try {
      const list = await getWorkspaces();
      setWorkspaces(list);
      const ids = new Set(list.map((w) => w.workspace_id));
      setConversations((prev) => pruneConversationsForWorkspaces(prev, ids));
      return list;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setWorkspaces([]);
        return [];
      }
      const message =
        err instanceof ApiError && (err.status === 404 || err.status === 405)
          ? 'Workspace API is not available yet.'
          : err instanceof Error
            ? err.message
            : 'Failed to load workspaces.';
      setWorkspacesError(message);
      setWorkspaces([]);
      return [];
    }
  }, []);

  const bootstrap = useCallback(async () => {
    setIsLoadingWorkspaces(true);
    try {
      await getHealth();
    } catch {
      // health failure handled by useApiStatus
    }

    const list = await refreshWorkspaces();
    const ids = new Set(list.map((w) => w.workspace_id));
    const persisted = persistedRef.current;
    const restored = pruneConversationsForWorkspaces(
      persisted?.conversations ?? {},
      ids,
    );
    setConversations(restored);

    const preferred = persisted?.activeWorkspaceId?.trim() || null;
    const nextId = pickDefaultWorkspaceId(list, preferred);
    setActiveWorkspaceId(nextId);
    if (nextId) {
      void loadWorkspaceDetail(nextId);
    }
  }, [refreshWorkspaces, loadWorkspaceDetail]);

  useEffect(() => {
    void bootstrap().finally(() => setIsLoadingWorkspaces(false));
  }, [bootstrap]);

  const selectWorkspace = useCallback(
    async (workspaceId: string) => {
      setActiveWorkspaceId(workspaceId);
      if (!workspaceDetails[workspaceId]) {
        await loadWorkspaceDetail(workspaceId);
      }
    },
    [workspaceDetails, loadWorkspaceDetail],
  );

  const setUploadDragging = useCallback((dragging: boolean) => {
    setUploadState((prev) => {
      if (prev.status === 'uploading') return prev;
      return dragging ? { status: 'dragging' } : { status: 'idle' };
    });
  }, []);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const validationError = validatePdfFiles(files);
      if (validationError) {
        setUploadState({
          status: 'error',
          error: validationError,
          filename: files[0]?.name,
        });
        return;
      }

      const timers: ReturnType<typeof setTimeout>[] = [];
      const label =
        files.length === 1 ? files[0].name : `${files.length} PDFs`;
      setUploadState({
        status: 'uploading',
        progressLabel: UPLOAD_PROGRESS_STEPS[0],
        filename: label,
      });
      UPLOAD_PROGRESS_STEPS.forEach((step, i) => {
        timers.push(
          setTimeout(() => {
            setUploadState((s) =>
              s.status === 'uploading' ? { ...s, progressLabel: step } : s,
            );
          }, i * 1400),
        );
      });

      try {
        const result = await uploadWorkspace(files);
        timers.forEach(clearTimeout);

        const summary: WorkspaceSummary = {
          workspace_id: result.workspace_id,
          title: result.title,
          status: result.status,
          index_ready: result.index_ready,
          document_count: result.document_count,
          total_pages: result.total_pages,
          total_chunks: result.total_chunks,
        };

        const detail: WorkspaceDetail = {
          ...summary,
          documents: result.documents,
        };

        setWorkspaces((prev) => {
          const filtered = prev.filter((w) => w.workspace_id !== summary.workspace_id);
          return [summary, ...filtered];
        });
        setWorkspaceDetails((prev) => ({ ...prev, [summary.workspace_id]: detail }));

        const docCount = result.document_count;
        const systemContent =
          docCount > 1
            ? `Workspace ready. You can now ask questions across ${docCount} documents.`
            : 'Workspace ready. You can now ask questions about this document.';

        setConversations((prev) => ({
          ...prev,
          [summary.workspace_id]: {
            workspaceId: summary.workspace_id,
            messages: [
              {
                id: `sys-${uuidv4()}`,
                workspaceId: summary.workspace_id,
                role: 'system',
                content: systemContent,
                createdAt: new Date().toISOString(),
              },
            ],
            lastSources: [],
            updatedAt: new Date().toISOString(),
          },
        }));

        setActiveWorkspaceId(summary.workspace_id);
        setUploadState({
          status: 'success',
          progressLabel: 'Workspace ready',
          filename: label,
        });
        setTimeout(() => {
          setUploadState((s) => (s.status === 'success' ? { status: 'idle' } : s));
        }, 3000);

        await refreshWorkspaces();
      } catch (err) {
        timers.forEach(clearTimeout);
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Upload failed. Please try again.';
        setUploadState({
          status: 'error',
          error: message,
          filename: label,
        });
      }
    },
    [refreshWorkspaces],
  );

  const sendMessage = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed) return;

      const requestWorkspaceId = activeWorkspaceId;
      if (!requestWorkspaceId) {
        throw new Error('Upload a workspace first.');
      }

      const ws =
        workspaces.find((w) => w.workspace_id === requestWorkspaceId) ??
        workspaceDetails[requestWorkspaceId];
      if (!ws?.index_ready && ws?.status !== 'ready') {
        throw new Error('Workspace is still indexing. Please wait.');
      }

      const userMsg: ChatMessage = {
        id: `msg-${uuidv4()}`,
        workspaceId: requestWorkspaceId,
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      setConversations((prev) => {
        const conv = ensureConversation(prev, requestWorkspaceId);
        return {
          ...prev,
          [requestWorkspaceId]: {
            ...conv,
            messages: [...conv.messages, userMsg],
            updatedAt: new Date().toISOString(),
          },
        };
      });

      setIsAssistantTyping(true);

      try {
        const result = await askWorkspace(trimmed, requestWorkspaceId);
        const sources = filterSourcesForWorkspace(result.sources, requestWorkspaceId);

        const assistantMsg: ChatMessage = {
          id: `msg-${uuidv4()}`,
          workspaceId: requestWorkspaceId,
          role: 'assistant',
          content: result.answer,
          createdAt: new Date().toISOString(),
          sources,
          citations: result.citations,
          confidence: result.confidence ?? undefined,
          latencyMs: result.latencyMs,
          retrievalUsed: result.retrievalUsed,
        };

        setConversations((prev) => {
          const conv = ensureConversation(prev, requestWorkspaceId);
          return {
            ...prev,
            [requestWorkspaceId]: updateConversationMetadata(
              {
                ...conv,
                messages: [...conv.messages, assistantMsg],
              },
              {
                lastSources: sources,
                lastConfidence: result.confidence,
                lastLatencyMs: result.latencyMs,
              },
            ),
          };
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to get answer';

        setConversations((prev) => {
          const conv = ensureConversation(prev, requestWorkspaceId);
          return {
            ...prev,
            [requestWorkspaceId]: updateConversationMetadata(
              {
                ...conv,
                messages: [
                  ...conv.messages,
                  {
                    id: `msg-${uuidv4()}`,
                    workspaceId: requestWorkspaceId,
                    role: 'assistant',
                    content:
                      'Sorry, I encountered an error processing your question. Please try again.',
                    createdAt: new Date().toISOString(),
                    error: message,
                  },
                ],
              },
              {
                lastSources: [],
                lastConfidence: null,
                lastLatencyMs: undefined,
              },
            ),
          };
        });
        throw err;
      } finally {
        setIsAssistantTyping(false);
      }
    },
    [activeWorkspaceId, workspaces, workspaceDetails],
  );

  const clearConversation = useCallback(
    (workspaceId?: string) => {
      const id = workspaceId ?? activeWorkspaceId;
      if (!id) return;
      setConversations((prev) => ({
        ...prev,
        [id]: createEmptyConversation(id),
      }));
    },
    [activeWorkspaceId],
  );

  const deleteDocumentById = useCallback(
    async (documentId: string) => {
      if (!activeWorkspaceId) return;
      setDeletingDocumentId(documentId);
      setWorkspacesError(null);
      try {
        await apiDeleteWorkspaceDocument(activeWorkspaceId, documentId);
        await loadWorkspaceDetail(activeWorkspaceId);
        await refreshWorkspaces();
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Não foi possível remover o documento.';
        setWorkspacesError(message);
        throw err;
      } finally {
        setDeletingDocumentId(null);
      }
    },
    [activeWorkspaceId, loadWorkspaceDetail, refreshWorkspaces],
  );

  const deleteWorkspaceById = useCallback(
    async (workspaceId: string) => {
      setDeletingWorkspaceId(workspaceId);
      try {
        await apiDeleteWorkspace(workspaceId);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setWorkspacesError(
            'Workspace was not found on the server. Refreshing list…',
          );
          await refreshWorkspaces();
        }
        throw err;
      } finally {
        setDeletingWorkspaceId(null);
      }

      setConversations((prev) => {
        const next = { ...prev };
        delete next[workspaceId];
        return next;
      });
      setWorkspaceDetails((prev) => {
        const next = { ...prev };
        delete next[workspaceId];
        return next;
      });

      const list = await refreshWorkspaces();
      if (activeWorkspaceId === workspaceId) {
        const nextId = pickDefaultWorkspaceId(list, null);
        setActiveWorkspaceId(nextId);
        if (nextId) void loadWorkspaceDetail(nextId);
      }
    },
    [activeWorkspaceId, refreshWorkspaces, loadWorkspaceDetail],
  );

  const getMessageCount = useCallback(
    (workspaceId: string) =>
      countUserFacingMessages(
        ensureConversation(conversations, workspaceId).messages,
      ),
    [conversations],
  );

  const isUploading = uploadState.status === 'uploading';

  return {
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    activeWorkspaceDetail: activeWorkspaceId
      ? workspaceDetails[activeWorkspaceId]
      : null,
    workspaceDetails,
    conversations,
    activeMessages,
    activeLastSources,
    activeLastConfidence: activeConversation?.lastConfidence,
    activeLastLatencyMs: activeConversation?.lastLatencyMs,
    uploadState,
    isLoadingWorkspaces,
    workspacesError,
    isUploading,
    isAssistantTyping,
    deletingWorkspaceId,
    deletingDocumentId,
    refreshWorkspaces,
    selectWorkspace,
    uploadFiles,
    sendMessage,
    clearConversation,
    deleteWorkspace: deleteWorkspaceById,
    deleteDocument: deleteDocumentById,
    setUploadDragging,
    getMessageCount,
  };
}
