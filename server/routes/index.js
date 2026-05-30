import { Router } from 'express';
import multer from 'multer';
import {
  clearIndex,
  completeIndexing,
  getState,
  setProcessing,
} from '../store/indexState.js';
import { generateMockAnswer } from '../services/answerMock.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      cb(new Error('Only PDF files are supported'));
      return;
    }
    cb(null, true);
  },
});

export const router = Router();

router.get('/', (_req, res) => {
  const state = getState();
  res.json({
    status: 'DocMind API online',
    endpoints: [
      '/ask (POST) - Ask questions about documents',
      '/upload (POST) - Upload PDF files to process',
      '/clear (DELETE) - Clear/reset the document index',
    ],
    health: state.health,
    index_ready: state.indexReady,
    processing: state.processing,
    active_file: state.activeFileName,
    pages: state.pages,
    chunks: state.chunks,
  });
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ detail: 'No file provided' });
    return;
  }

  const replace = req.query.replace !== 'false';
  const fileName = req.file.originalname;
  const pages = Math.floor(8 + Math.random() * 72);
  const chunks = Math.round(pages * 6.5 + Math.floor(10 + Math.random() * 40));

  setProcessing(fileName);

  const processingMs = 3500 + Math.floor(Math.random() * 2500);
  setTimeout(() => {
    completeIndexing({ fileName, pages, chunks, replace });
  }, processingMs);

  res.json({ pages, chunks, fileName, processingMs });
});

router.post('/ask', (req, res) => {
  const state = getState();
  const question = req.body?.question?.trim();

  if (!question) {
    res.status(400).json({ detail: 'Question is required' });
    return;
  }

  if (!state.indexReady) {
    res.status(503).json({ detail: 'Document index is still loading' });
    return;
  }

  if (state.documents.length === 0 && !state.activeFileName) {
    res.status(400).json({ detail: 'No document indexed. Upload a PDF first.' });
    return;
  }

  const delay = 400 + Math.floor(Math.random() * 600);
  setTimeout(() => {
    const { answer, sources } = generateMockAnswer(question);
    res.json({ answer, sources });
  }, delay);
});

router.delete('/clear', (_req, res) => {
  clearIndex();
  res.json({ status: 'cleared', index_ready: false });
});

router.use((err, _req, res) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ detail: err.message });
    return;
  }
  res.status(400).json({ detail: err.message || 'Bad request' });
});
