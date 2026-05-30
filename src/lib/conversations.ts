import type { ChatMessage, Source, WorkspaceConversation } from './types';

export function createEmptyConversation(workspaceId: string): WorkspaceConversation {
  return {
    workspaceId,
    messages: [],
    lastSources: [],
    lastConfidence: undefined,
    lastLatencyMs: undefined,
    updatedAt: new Date().toISOString(),
  };
}

export function ensureConversation(
  conversations: Record<string, WorkspaceConversation>,
  workspaceId: string,
): WorkspaceConversation {
  if (conversations[workspaceId]) return conversations[workspaceId];
  return createEmptyConversation(workspaceId);
}

export function updateConversationMetadata(
  conv: WorkspaceConversation,
  payload: {
    lastSources?: Source[];
    lastConfidence?: string | null;
    lastLatencyMs?: number;
  },
): WorkspaceConversation {
  return {
    ...conv,
    lastSources: payload.lastSources ?? conv.lastSources,
    lastConfidence:
      payload.lastConfidence === null
        ? undefined
        : (payload.lastConfidence ?? conv.lastConfidence),
    lastLatencyMs: payload.lastLatencyMs ?? conv.lastLatencyMs,
    updatedAt: new Date().toISOString(),
  };
}

export function countUserFacingMessages(messages: ChatMessage[]): number {
  return messages.filter((m) => m.role === 'user' || m.role === 'assistant').length;
}

/** UI display shape (legacy components expect timestamp + citations). */
type MessageRole = ChatMessage['role'] | 'typing';

/** Primeira mensagem de cada sequência contígua do assistente (avatar + nome uma vez). */
export function withAssistantGrouping<T extends { role: MessageRole }>(
  messages: T[],
): (T & { showAssistantIdentity: boolean })[] {
  return messages.map((msg, index) => {
    const isAssistant = msg.role === 'assistant' || msg.role === 'typing';
    if (!isAssistant) {
      return { ...msg, showAssistantIdentity: false };
    }
    const prev = messages[index - 1];
    const prevIsAssistant =
      prev != null && (prev.role === 'assistant' || prev.role === 'typing');
    return { ...msg, showAssistantIdentity: !prevIsAssistant };
  });
}

export function toDisplayMessage(msg: ChatMessage) {
  const citations =
    msg.citations ??
    (msg.sources?.map((s) => {
      const name = s.filename ?? s.fileName;
      if (name) return name;
      if (s.page != null) return `Page ${s.page}`;
      if (s.section) return s.section;
      if (s.chunkId != null) return `Chunk ${s.chunkId}`;
      return 'Source';
    }) ?? []);

  return {
    ...msg,
    citations,
    timestamp: msg.createdAt,
  };
}
