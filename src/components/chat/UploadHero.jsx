import { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { MAX_FILES_PER_WORKSPACE } from '../../lib/uploadLimits';

export default function UploadHero({
  onUpload,
  uploadState,
  isUploading,
  disabled,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (fileList) => {
    if (!fileList?.length || disabled || isUploading) return;
    onUpload(Array.from(fileList));
  };

  const busy = disabled || isUploading;

  return (
    <div
      className={clsx(
        'upload-hero',
        dragOver && 'upload-hero--dragover',
        busy && 'upload-hero--disabled',
      )}
      onDragOver={(e) => {
        e.preventDefault();
        if (!busy) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (busy) return;
        handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="upload-hero__input"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {isUploading ? (
        <Loader2 size={28} className="upload-hero__spinner" aria-hidden />
      ) : (
        <i className="ti ti-upload upload-hero__icon" aria-hidden />
      )}

      <h3 className="upload-hero__title">Upload PDFs to start</h3>
      <p className="upload-hero__desc">
        Each upload creates an isolated RAG workspace. You can upload one document or a
        small group of related PDFs (up to {MAX_FILES_PER_WORKSPACE}).
      </p>

      {uploadState?.status === 'uploading' && uploadState.progressLabel && (
        <p className="upload-hero__progress" role="status">
          {uploadState.progressLabel}
        </p>
      )}

      {uploadState?.status === 'error' && uploadState.error && (
        <p className="upload-hero__error" role="alert">
          {uploadState.error}
        </p>
      )}

      <button
        type="button"
        className="upload-hero__btn"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? 'Processing…' : 'Upload PDFs'}
      </button>

      <p className="upload-hero__hint">or drag and drop PDFs here</p>
    </div>
  );
}
