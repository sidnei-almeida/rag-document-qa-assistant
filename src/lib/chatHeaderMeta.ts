import type { WorkspaceDetail, WorkspaceSummary } from './types';
import { headerShortWorkspaceId } from './workspaceDisplay';

export interface ChatHeaderBreadcrumb {
  workspaceIdLabel: string;
  segments: string[];
}

export function formatChatHeaderBreadcrumb(
  workspace: WorkspaceSummary,
  detail?: WorkspaceDetail | null,
): ChatHeaderBreadcrumb {
  const docs = workspace.document_count ?? 0;
  const docLabel = docs === 1 ? '1 doc' : `${docs} docs`;

  const segments = [docLabel];

  if (workspace.total_chunks != null) {
    segments.push(`${workspace.total_chunks} chunks`);
  }

  segments.push(detail?.vector_store ?? 'FAISS');
  segments.push('Groq');

  return {
    workspaceIdLabel: `Workspace ${headerShortWorkspaceId(workspace.workspace_id)}`,
    segments,
  };
}

/** Primary title: first document filename, else workspace title. */
export function formatChatHeaderTitle(
  workspace: WorkspaceSummary | null | undefined,
  detail?: WorkspaceDetail | null,
): string {
  if (!workspace) return 'No workspace selected';
  const docName = detail?.documents?.[0]?.filename;
  return docName ?? workspace.title ?? 'Untitled workspace';
}
