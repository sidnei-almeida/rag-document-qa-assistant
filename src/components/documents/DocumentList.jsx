import DocumentItem from './DocumentItem';
import { canDeleteDocument } from '../../lib/documents';

export default function DocumentList({
  documents,
  activeDocumentId,
  onSelectDocument,
  onDeleteDocument,
  getMessageCount,
  deletingDocumentId,
}) {
  if (documents.length === 0) {
    return (
      <div className="document-list__empty-block">
        <p className="document-list__empty">No documents yet</p>
        <p className="document-list__empty-sub">Upload a PDF to start</p>
      </div>
    );
  }

  return (
    <div className="document-list">
      {documents.map((doc) => (
        <DocumentItem
          key={doc.id}
          document={doc}
          isActive={doc.id === activeDocumentId}
          messageCount={getMessageCount?.(doc.id) ?? 0}
          canDelete={canDeleteDocument(doc)}
          isDeleting={deletingDocumentId === doc.id}
          onSelect={onSelectDocument}
          onDelete={onDeleteDocument}
        />
      ))}
    </div>
  );
}
