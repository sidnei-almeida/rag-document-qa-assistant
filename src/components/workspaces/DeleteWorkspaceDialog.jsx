import Button from '../ui/Button';

export default function DeleteWorkspaceDialog({
  open,
  workspaceTitle,
  loading,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="dialog"
        role="alertdialog"
        aria-labelledby="delete-ws-title"
        aria-describedby="delete-ws-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="delete-ws-title" className="dialog__title">
          Delete workspace?
        </h3>
        <p id="delete-ws-desc" className="dialog__body">
          {workspaceTitle ? (
            <>
              <strong>{workspaceTitle}</strong> will be removed along with the uploaded
              documents, vector index, and local conversation history for this workspace.
            </>
          ) : (
            'This will remove the uploaded documents, vector index, and local conversation history for this workspace.'
          )}
        </p>
        <div className="dialog__actions">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete workspace'}
          </Button>
        </div>
      </div>
    </div>
  );
}
