import type { Source } from './types';

export interface GroupedEvidenceRow {
  id: string;
  filename: string;
  page: number | null;
  chunkId: string | number | null;
  count: number;
}

function sourceFilename(source: Source): string {
  return source.filename ?? source.fileName ?? 'Document';
}

/** Collapse duplicate filename + page (or chunk) hits into one row with a count. */
export function groupEvidenceSources(sources: Source[]): GroupedEvidenceRow[] {
  const map = new Map<string, GroupedEvidenceRow>();

  sources.forEach((source, index) => {
    const filename = sourceFilename(source);
    const page = source.page ?? null;
    const chunkId = source.chunk_id ?? source.chunkId ?? null;

    let key: string;
    if (page != null) {
      key = `${filename}\u0000p\u0000${page}`;
    } else if (chunkId != null) {
      key = `${filename}\u0000c\u0000${chunkId}`;
    } else {
      key = `${filename}\u0000i\u0000${index}`;
    }

    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, {
        id: key,
        filename,
        page,
        chunkId,
        count: 1,
      });
    }
  });

  return Array.from(map.values());
}
