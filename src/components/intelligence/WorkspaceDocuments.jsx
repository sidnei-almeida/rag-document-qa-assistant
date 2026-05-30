import { useState } from 'react';
import { FileType, Trash2 } from 'lucide-react';
import IconButton from '../ui/IconButton';
import DeleteDocumentDialog from '../documents/DeleteDocumentDialog';

function formatDocMeta(doc) {
  const parts = [];
  if (doc.pages != null) parts.push(`${doc.pages} pages`);
  if (doc.chunks != null) parts.push(`${doc.chunks} chunks`);
  return parts.length ? parts.join(' · ') : '—';
}

function isDocumentReady(doc) {
  return !doc.status || doc.status === 'ready';
}

export default function WorkspaceDocuments({
  documents,
  workspaceId,
  onDeleteDocument,
  deletingDocumentId,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (!documents?.length) {
    return <p className="panel-empty panel-empty--muted">No documents in this workspace.</p>;
  }

  return (
    <>
      <ul className="intel-doc-list">
        {documents.map((doc) => (
          <li key={doc.document_id} className="intel-doc-item">
            <FileType
              className="intel-doc-item__icon"
              size={13}
              strokeWidth={1.75}
              aria-hidden
            />
            <div className="intel-doc-item__body">
              <div className="intel-doc-item__title-row">
                <span className="intel-doc-item__name" title={doc.filename}>
                  {doc.filename}
                </span>
                {isDocumentReady(doc) && (
                  <span className="intel-doc-item__ready" title="Ready" aria-label="Ready" />
                )}
              </div>
              <span className="intel-doc-item__meta">{formatDocMeta(doc)}</span>
            </div>
            <IconButton
              label={`Remove ${doc.filename}`}
              size="sm"
              className="intel-doc-item__delete"
              disabled={Boolean(deletingDocumentId)}
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(doc);
              }}
            >
              <Trash2 size={14} strokeWidth={1.75} />
            </IconButton>
          </li>
        ))}
      </ul>

      <DeleteDocumentDialog
        open={Boolean(deleteTarget)}
        documentName={deleteTarget?.filename}
        loading={Boolean(deletingDocumentId)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget || !workspaceId) return;
          try {
            await onDeleteDocument?.(deleteTarget.document_id);
            setDeleteTarget(null);
          } catch {
            // error surfaced via banner
          }
        }}
      />
    </>
  );
}
