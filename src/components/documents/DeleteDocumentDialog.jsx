import Button from '../ui/Button';

export default function DeleteDocumentDialog({
  open,
  documentName,
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
        aria-labelledby="delete-doc-title"
        aria-describedby="delete-doc-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="delete-doc-title" className="dialog__title">
          Delete document?
        </h3>
        <p id="delete-doc-desc" className="dialog__body">
          {documentName ? (
            <>
              <strong>{documentName}</strong> will be removed along with its index
              and local conversation history.
            </>
          ) : (
            'This will remove the document, its index, and its local conversation history.'
          )}
        </p>
        <div className="dialog__actions">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete document'}
          </Button>
        </div>
      </div>
    </div>
  );
}
