import { useCallback, useRef } from 'react';
import { Loader2, Upload, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export default function UploadDropzone({
  onUpload,
  onDraggingChange,
  uploadState,
  disabled,
}) {
  const inputRef = useRef(null);
  const status = uploadState?.status ?? 'idle';
  const isBusy = status === 'uploading' || disabled;

  const handleFile = useCallback(
    (file) => {
      if (!file || isBusy) return;
      onUpload(file);
    },
    [onUpload, isBusy],
  );

  const onDrop = (e) => {
    e.preventDefault();
    onDraggingChange?.(false);
    if (isBusy) return;
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const onChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = '';
  };

  const title =
    status === 'dragging'
      ? 'Drop your PDF here'
      : status === 'uploading'
        ? uploadState?.progressLabel ?? 'Uploading…'
        : status === 'success'
          ? 'Document ready'
          : 'Drop PDF here';

  const subtitle =
    status === 'uploading'
      ? 'Building isolated RAG workspace'
      : status === 'success'
        ? uploadState?.filename ?? 'Ready to chat'
        : status === 'error'
          ? uploadState?.error ?? 'Upload failed. Please try again.'
          : 'Creates an isolated workspace';

  return (
    <div className="upload-dropzone-wrap">
      <div
        className={clsx(
          'upload-dropzone',
          'upload-dropzone--compact',
          status === 'dragging' && 'upload-dropzone--dragover',
          isBusy && 'upload-dropzone--disabled',
          status === 'uploading' && 'upload-dropzone--uploading',
          status === 'success' && 'upload-dropzone--success',
          status === 'error' && 'upload-dropzone--error',
        )}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isBusy) onDraggingChange?.(true);
        }}
        onDragLeave={() => onDraggingChange?.(false)}
        onDrop={onDrop}
        onClick={() => !isBusy && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-busy={status === 'uploading'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!isBusy) inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="upload-dropzone__input"
          onChange={onChange}
          disabled={isBusy}
          aria-label="Upload PDF file"
        />
        {status === 'uploading' ? (
          <Loader2 size={18} className="upload-dropzone__icon upload-dropzone__spinner" />
        ) : status === 'success' ? (
          <CheckCircle2 size={18} className="upload-dropzone__icon upload-dropzone__icon--success" />
        ) : (
          <Upload size={18} className="upload-dropzone__icon" strokeWidth={1.5} />
        )}
        <p className="upload-dropzone__title">{title}</p>
        <p
          className={clsx(
            'upload-dropzone__subtitle',
            status === 'error' && 'upload-dropzone__subtitle--error',
          )}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
