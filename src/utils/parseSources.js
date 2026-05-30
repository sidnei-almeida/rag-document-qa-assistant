/**
 * Defensive normalizer for /ask `sources` payloads (field names may vary).
 * @param {unknown[]} sources
 * @param {string} [fallbackWorkspaceId]
 */
export function parseSourcesFromResponse(sources, fallbackWorkspaceId) {
  if (!Array.isArray(sources) || sources.length === 0) return [];

  return sources.map((item, index) => {
    if (typeof item === 'string') {
      return {
        id: `src-${index}`,
        fileName: null,
        page: null,
        chunkId: null,
        score: null,
        preview: item,
        section: null,
      };
    }

    if (typeof item === 'number') {
      return {
        id: `src-${index}`,
        fileName: null,
        page: item + 1,
        chunkId: null,
        score: null,
        preview: null,
        section: null,
      };
    }

    const page =
      item.page ??
      item.page_number ??
      (item.page_index != null ? Number(item.page_index) + 1 : null);

    const fileName =
      item.filename ??
      item.file_name ??
      item.fileName ??
      item.document ??
      item.source ??
      null;

    return {
      id: String(item.chunk_id ?? item.id ?? item.chunk ?? index),
      workspace_id: item.workspace_id ?? fallbackWorkspaceId ?? undefined,
      document_id: item.document_id ?? undefined,
      document: item.document ?? fileName ?? undefined,
      fileName,
      filename: item.filename ?? fileName ?? undefined,
      page: page != null ? Number(page) : null,
      chunkId: item.chunk_id ?? item.chunk ?? null,
      chunk_id: item.chunk_id ?? item.chunk ?? undefined,
      score:
        item.score ??
        item.similarity ??
        item.relevance_score ??
        item.distance ??
        null,
      preview: item.preview ?? item.text ?? item.content ?? item.snippet ?? item.excerpt ?? null,
      text: item.text ?? item.preview ?? undefined,
      section: item.section ?? item.title ?? item.heading ?? null,
    };
  });
}

export function formatSourceCitationLabel(source) {
  if (typeof source === 'string') return source;
  if (source.page != null) return `Page ${source.page}`;
  if (source.section) return source.section;
  if (source.fileName) return source.fileName;
  if (source.chunkId != null) return `Chunk ${source.chunkId}`;
  return 'Source';
}

export function formatConfidence(confidence) {
  if (confidence == null) return null;
  if (typeof confidence === 'string') return confidence;
  if (typeof confidence === 'number') return confidence.toFixed(2);
  if (confidence.label) return confidence.label;
  if (confidence.score != null) return String(confidence.score);
  return null;
}
