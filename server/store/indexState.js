/** In-memory workspace state (replace with DB + vector store later). */

const state = {
  health: 'ok',
  indexReady: false,
  processing: false,
  activeFileName: null,
  pages: 0,
  chunks: 0,
  documents: [],
};

export function getState() {
  return state;
}

export function setProcessing(fileName) {
  state.processing = true;
  state.indexReady = false;
  state.activeFileName = fileName;
}

export function completeIndexing({ fileName, pages, chunks, replace }) {
  if (replace) {
    state.documents = [];
  }
  state.documents.push({ fileName, pages, chunks, indexedAt: new Date().toISOString() });
  state.pages = pages;
  state.chunks = chunks;
  state.processing = false;
  state.indexReady = true;
}

export function clearIndex() {
  state.documents = [];
  state.activeFileName = null;
  state.pages = 0;
  state.chunks = 0;
  state.indexReady = false;
  state.processing = false;
}
