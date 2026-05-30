import type { WorkspaceDetail, WorkspaceSummary } from './types';

export function shortWorkspaceId(workspaceId: string): string {
  if (!workspaceId) return '—';
  if (workspaceId.length <= 12) return workspaceId;
  return `${workspaceId.slice(0, 8)}…`;
}

/** Truncated workspace id for chat header breadcrumb (10 chars + ellipsis). */
export function headerShortWorkspaceId(workspaceId: string, maxLen = 10): string {
  if (!workspaceId) return '—';
  if (workspaceId.length <= maxLen) return workspaceId;
  return `${workspaceId.slice(0, maxLen)}…`;
}

export function formatWorkspaceMetaLine(ws: WorkspaceSummary | WorkspaceDetail): string {
  const docs = ws.document_count ?? 0;
  const docLabel = docs === 1 ? '1 doc' : `${docs} docs`;
  const parts = [docLabel];
  if (ws.total_pages != null) parts.push(`${ws.total_pages} pages`);
  if (ws.total_chunks != null) parts.push(`${ws.total_chunks} chunks`);
  return parts.join(' · ');
}

export function workspaceStatusLabel(status: string | undefined): string {
  if (status === 'ready') return 'Ready';
  if (status === 'error') return 'Error';
  return 'Processing';
}

export function pickDefaultWorkspaceId(
  workspaces: WorkspaceSummary[],
  preferredId: string | null,
): string | null {
  if (!workspaces.length) return null;
  if (preferredId && workspaces.some((w) => w.workspace_id === preferredId)) {
    return preferredId;
  }
  const sorted = [...workspaces].sort((a, b) => {
    const ta = Date.parse(a.updated_at ?? a.created_at ?? '') || 0;
    const tb = Date.parse(b.updated_at ?? b.created_at ?? '') || 0;
    return tb - ta;
  });
  return sorted[0]?.workspace_id ?? null;
}

export function filterSourcesForWorkspace(
  sources: import('./types').Source[],
  workspaceId: string,
): import('./types').Source[] {
  return sources.filter(
    (s) => !s.workspace_id || s.workspace_id === workspaceId,
  );
}
