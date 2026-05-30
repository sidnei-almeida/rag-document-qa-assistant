import { FileText, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import Badge from '../ui/Badge';
import IconButton from '../ui/IconButton';

const STATUS_VARIANT = {
  ready: 'ready',
  processing: 'processing',
  missing: 'processing',
  error: 'error',
};

const STATUS_LABEL = {
  ready: 'Ready',
  processing: 'Processing',
  missing: 'Missing',
  error: 'Error',
};

export default function DocumentItem({
  document,
  isActive,
  messageCount = 0,
  canDelete = false,
  isDeleting = false,
  onSelect,
  onDelete,
}) {
  const canSelect = document.isAskEnabled && document.indexReady;
  const showMeta = document.pages != null && document.chunks != null;

  return (
    <div
      className={clsx('document-item-row', isActive && 'document-item-row--active')}
    >
      <button
        type="button"
        className={clsx(
          'document-item',
          isActive && 'document-item--active',
          !canSelect && 'document-item--disabled',
        )}
        onClick={() => onSelect(document.id)}
        aria-current={isActive ? 'true' : undefined}
      >
        <span className="document-item__icon" aria-hidden="true">
          <FileText size={16} />
        </span>
        <span className="document-item__body">
          <span className="document-item__name">{document.name}</span>
          {showMeta ? (
            <span className="document-item__meta">
              {document.pages} pages · {document.chunks} chunks
              {messageCount > 0 &&
                ` · ${messageCount} message${messageCount === 1 ? '' : 's'}`}
            </span>
          ) : (
            messageCount > 0 && (
              <span className="document-item__meta">
                {messageCount} message{messageCount === 1 ? '' : 's'}
              </span>
            )
          )}
          {isActive && (
            <span className="document-item__active-label">Active</span>
          )}
        </span>
        <Badge
          variant={STATUS_VARIANT[document.status] || 'processing'}
          className="document-item__badge"
        >
          {STATUS_LABEL[document.status] || document.status}
        </Badge>
      </button>
      {canDelete && (
        <IconButton
          variant="ghost"
          size="sm"
          className="document-item-row__delete"
          aria-label={`Delete ${document.name}`}
          title="Delete document"
          disabled={isDeleting}
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(document);
          }}
        >
          <Trash2 size={14} />
        </IconButton>
      )}
    </div>
  );
}
