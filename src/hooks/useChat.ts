import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { askQuestion } from '../lib/api';
import type { ChatMessage, CurrentDocument, Source } from '../lib/types';

interface UseChatOptions {
  currentDocument: CurrentDocument | null;
  addMessage: (message: ChatMessage) => void;
  updateLastAnswerMetadata: (payload: {
    lastSources?: Source[];
    lastConfidence?: string | null;
    lastLatencyMs?: number;
  }) => void;
  onError?: (message: string) => void;
}

export function useChat({
  currentDocument,
  addMessage,
  updateLastAnswerMetadata,
  onError,
}: UseChatOptions) {
  const [isPending, setIsPending] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!currentDocument?.indexReady || !currentDocument.isAskEnabled) {
        onError?.('Upload a PDF to start asking questions.');
        return;
      }

      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: ChatMessage = {
        id: `msg-${uuidv4()}`,
        documentId: 'current',
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      addMessage(userMsg);
      setIsPending(true);

      try {
        const result = await askQuestion(trimmed);

        addMessage({
          id: `msg-${uuidv4()}`,
          documentId: 'current',
          role: 'assistant',
          content: result.answer,
          createdAt: new Date().toISOString(),
          sources: result.sources,
          citations: result.citations,
          confidence: result.confidence ?? undefined,
          latencyMs: result.latencyMs,
        });

        updateLastAnswerMetadata({
          lastSources: result.sources,
          lastConfidence: result.confidence,
          lastLatencyMs: result.latencyMs,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to get answer';
        onError?.(message);

        addMessage({
          id: `msg-${uuidv4()}`,
          documentId: 'current',
          role: 'assistant',
          content:
            'Sorry, I encountered an error processing your question. Please try again.',
          createdAt: new Date().toISOString(),
          error: message,
        });

        updateLastAnswerMetadata({
          lastSources: [],
          lastConfidence: null,
          lastLatencyMs: undefined,
        });
      } finally {
        setIsPending(false);
      }
    },
    [currentDocument, addMessage, updateLastAnswerMetadata, onError],
  );

  return {
    sendMessage,
    isAssistantTyping: isPending,
  };
}
