/** Document IDs the user has opened in this browser (uploads + optional sample). */
const WORKSPACE_IDS_KEY = 'docmind:v2:workspace-ids';

export function loadWorkspaceIds(): Set<string> {
  try {
    const raw = localStorage.getItem(WORKSPACE_IDS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function saveWorkspaceIds(ids: Set<string>): void {
  try {
    localStorage.setItem(WORKSPACE_IDS_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

export function registerWorkspaceId(documentId: string): void {
  const ids = loadWorkspaceIds();
  ids.add(documentId);
  saveWorkspaceIds(ids);
}

export function unregisterWorkspaceId(documentId: string): void {
  const ids = loadWorkspaceIds();
  ids.delete(documentId);
  saveWorkspaceIds(ids);
}

export function mergeWorkspaceIds(
  stored: Set<string>,
  conversationKeys: string[],
): Set<string> {
  const merged = new Set(stored);
  for (const key of conversationKeys) {
    if (key.trim()) merged.add(key);
  }
  return merged;
}
