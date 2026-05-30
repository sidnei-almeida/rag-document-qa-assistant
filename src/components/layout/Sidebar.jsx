import { useState } from 'react';
import { Folder, HelpCircle, Plus, Trash2, Upload } from 'lucide-react';
import clsx from 'clsx';
import ModelAvatar from '../ui/ModelAvatar';
import IconButton from '../ui/IconButton';
import DeleteWorkspaceDialog from '../workspaces/DeleteWorkspaceDialog';
import UploadWorkspaceDialog from '../workspaces/UploadWorkspaceDialog';
import { formatWorkspaceMetaLine } from '../../lib/workspaceDisplay';

function workspaceStatusTitle(status) {
  if (status === 'ready') return 'Ready';
  if (status === 'error') return 'Error';
  return 'Processing';
}

function WorkspaceListItem({
  workspace,
  isActive,
  messageCount = 0,
  isDeleting = false,
  onSelect,
  onDelete,
}) {
  const canSelect = workspace.index_ready || workspace.status === 'ready';
  const metaParts = [formatWorkspaceMetaLine(workspace)];
  if (messageCount > 0) {
    metaParts.push(`${messageCount} msg${messageCount === 1 ? '' : 's'}`);
  }
  const metaLine = metaParts.join(' · ');
  const status = workspace.status ?? 'processing';

  return (
    <div className={clsx('workspace-item', isActive && 'workspace-item--active')}>
      <button
        type="button"
        className={clsx(
          'workspace-item__main',
          !canSelect && status === 'processing' && 'workspace-item__main--disabled',
        )}
        onClick={() => onSelect(workspace.workspace_id)}
        aria-current={isActive ? 'true' : undefined}
      >
        <Folder className="workspace-item__icon" size={12} strokeWidth={1.75} aria-hidden />
        <span className="workspace-item__content">
          <span className="workspace-item__row">
            <span className="workspace-item__name" title={workspace.title}>
              {workspace.title}
            </span>
            <span
              className={clsx(
                'workspace-item__status-dot',
                `workspace-item__status-dot--${status}`,
              )}
              title={workspaceStatusTitle(status)}
              aria-label={workspaceStatusTitle(status)}
            />
          </span>
          <span className="workspace-item__meta">{metaLine}</span>
        </span>
      </button>
      <IconButton
        variant="ghost"
        size="sm"
        className="workspace-item__delete"
        label={`Delete workspace ${workspace.title}`}
        disabled={isDeleting}
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(workspace);
        }}
      >
        <Trash2 size={12} strokeWidth={1.75} />
      </IconButton>
    </div>
  );
}

export default function Sidebar({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onUploadFiles,
  onDeleteWorkspace,
  uploadState,
  onUploadDraggingChange,
  isUploading,
  apiReady,
  isLoadingWorkspaces,
  getMessageCount,
  deletingWorkspaceId,
}) {
  const uploadDisabled = !apiReady || isUploading;
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const openUpload = () => {
    if (!uploadDisabled) setUploadOpen(true);
  };

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <div className="sidebar__brand">
          <span className="sidebar__logo-mark" aria-hidden />
          <span className="sidebar__name">DocMind</span>
        </div>
        <button
          type="button"
          className="sidebar__upload-btn"
          disabled={uploadDisabled}
          onClick={openUpload}
        >
          <Upload size={13} strokeWidth={1} aria-hidden />
          {isUploading ? uploadState?.progressLabel ?? 'Uploading…' : 'Upload PDFs'}
        </button>
      </header>

      <div className="sidebar__body">
        <section
          className="sidebar__section sidebar__section--library"
          aria-labelledby="sidebar-workspaces-label"
        >
          <h2 id="sidebar-workspaces-label" className="sidebar__section-label">
            Workspaces
          </h2>
          {isLoadingWorkspaces ? (
            <p className="document-list__empty">Loading workspaces…</p>
          ) : workspaces.length === 0 ? (
            <p className="document-list__empty">No workspaces yet</p>
          ) : (
            <div className="document-list">
              {workspaces.map((ws) => (
                <WorkspaceListItem
                  key={ws.workspace_id}
                  workspace={ws}
                  isActive={ws.workspace_id === activeWorkspaceId}
                  messageCount={getMessageCount(ws.workspace_id)}
                  isDeleting={deletingWorkspaceId === ws.workspace_id}
                  onSelect={onSelectWorkspace}
                  onDelete={(workspace) => setDeleteTarget(workspace)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            className="sidebar__new-workspace"
            disabled={uploadDisabled}
            onClick={openUpload}
          >
            <Plus size={11} aria-hidden strokeWidth={2} />
            New isolated workspace
          </button>
        </section>
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__profile">
          <ModelAvatar size={45} className="sidebar__avatar" alt="DocMind" />
          <div className="sidebar__profile-info">
            <span className="sidebar__profile-name">DocMind</span>
            <span className="sidebar__profile-role">Live HF Space</span>
          </div>
        </div>
        <a href="#" className="sidebar__help" onClick={(e) => e.preventDefault()}>
          <HelpCircle size={12} strokeWidth={1.75} aria-hidden />
          Help &amp; Documentation
        </a>
      </div>

      <UploadWorkspaceDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={onUploadFiles}
        uploadState={uploadState}
        onUploadDraggingChange={onUploadDraggingChange}
        disabled={uploadDisabled}
      />

      <DeleteWorkspaceDialog
        open={Boolean(deleteTarget)}
        workspaceTitle={deleteTarget?.title}
        loading={Boolean(deletingWorkspaceId)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await onDeleteWorkspace(deleteTarget.workspace_id);
            setDeleteTarget(null);
          } catch {
            // error surfaced via banner
          }
        }}
      />
    </aside>
  );
}
