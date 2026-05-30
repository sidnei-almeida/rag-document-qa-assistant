export const MAX_FILES_PER_WORKSPACE = 5;
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export const UPLOAD_PROGRESS_STEPS = [
  'Uploading workspace…',
  'Extracting text…',
  'Creating embeddings…',
  'Building vector index…',
] as const;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validatePdfFiles(files: File[]): string | null {
  if (!files.length) return 'Select at least one PDF file.';
  if (files.length > MAX_FILES_PER_WORKSPACE) {
    return `You can upload up to ${MAX_FILES_PER_WORKSPACE} PDFs per workspace.`;
  }
  for (const file of files) {
    const isPdf =
      file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    if (!isPdf) return 'Only PDF files are supported right now.';
    if (file.size > MAX_UPLOAD_BYTES) {
      return `"${file.name}" exceeds ${formatFileSize(MAX_UPLOAD_BYTES)}.`;
    }
  }
  return null;
}
