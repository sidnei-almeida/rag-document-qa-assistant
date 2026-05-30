import type { PersistedWorkspaceState, WorkspaceConversation } from './types';

export const STORAGE_KEY = 'docmind:v3:workspace-chats';

export function loadPersistedWorkspaceState(): PersistedWorkspaceState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedWorkspaceState;
    if (parsed?.version !== 3 || typeof parsed.conversations !== 'object') {
      return null;
    }
    return {
      version: 3,
      activeWorkspaceId: String(parsed.activeWorkspaceId ?? ''),
      conversations: parsed.conversations ?? {},
    };
  } catch {
    return null;
  }
}

export function savePersistedWorkspaceState(
  activeWorkspaceId: string | null,
  conversations: Record<string, WorkspaceConversation>,
): void {
  try {
    const payload: PersistedWorkspaceState = {
      version: 3,
      activeWorkspaceId: activeWorkspaceId ?? '',
      conversations: stripTypingMessages(conversations),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // quota or private mode
  }
}

function stripTypingMessages(
  conversations: Record<string, WorkspaceConversation>,
): Record<string, WorkspaceConversation> {
  const out: Record<string, WorkspaceConversation> = {};
  for (const [id, conv] of Object.entries(conversations)) {
    out[id] = {
      ...conv,
      messages: conv.messages.filter((m) => !m.id.startsWith('typing-')),
    };
  }
  return out;
}

export function pruneConversationsForWorkspaces(
  conversations: Record<string, WorkspaceConversation>,
  validWorkspaceIds: Set<string>,
): Record<string, WorkspaceConversation> {
  const out: Record<string, WorkspaceConversation> = {};
  for (const [id, conv] of Object.entries(conversations)) {
    if (validWorkspaceIds.has(id)) {
      out[id] = { ...conv, workspaceId: id };
    }
  }
  return out;
}
