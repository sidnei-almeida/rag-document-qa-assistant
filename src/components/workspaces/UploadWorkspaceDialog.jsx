import { useEffect } from 'react';
import { X } from 'lucide-react';
import WorkspaceDropzone from './WorkspaceDropzone';
import IconButton from '../ui/IconButton';

export default function UploadWorkspaceDialog({
  open,
  onClose,
  onUpload,
  uploadState,
  onUploadDraggingChange,
  disabled,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open && uploadState?.status === 'success') {
      const timer = window.setTimeout(onClose, 1400);
      return () => window.clearTimeout(timer);
    }
  }, [open, uploadState?.status, onClose]);

  if (!open) return null;

  const isUploading = uploadState?.status === 'uploading';

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="dialog dialog--upload"
        role="dialog"
        aria-labelledby="upload-ws-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__header">
          <h3 id="upload-ws-title" className="dialog__title">
            Upload PDFs
          </h3>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Close upload dialog"
            onClick={onClose}
            disabled={isUploading}
          >
            <X size={16} />
          </IconButton>
        </div>
        <p className="dialog__body dialog__body--lead">
          Add one or more PDFs to create a new isolated workspace. Each workspace has its
          own vector index and conversation history.
        </p>
        <WorkspaceDropzone
          onUpload={(files) => {
            onUpload(files);
          }}
          uploadState={uploadState}
          onDraggingChange={onUploadDraggingChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
