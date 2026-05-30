import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { PROCESSING_STEPS } from '../../utils/constants';
import { estimateChunks, formatFileSize, randomInt } from '../../utils/formatters';
import {
  DEFAULT_EMBEDDING_DIMENSION,
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_RERANK_MODEL,
  DEFAULT_RETRIEVAL_MODE,
  DEFAULT_SCORE_THRESHOLD,
  DEFAULT_TOP_K,
  DOCUMENT_STATUS,
} from '../../utils/constants';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function checkHealth() {
  await delay(800);
  return { status: 'ready', latency: '142ms', health: 'ok', index_ready: true };
}

export async function processDocument(file, onStepChange) {
  for (let i = 0; i < PROCESSING_STEPS.length; i++) {
    onStepChange?.(
      PROCESSING_STEPS.map((step, idx) => {
        if (idx < i) return { ...step, state: 'completed' };
        if (idx === i) return { ...step, state: 'active' };
        return { ...step, state: 'pending' };
      }),
    );
    await delay(600 + randomInt(100, 400));
  }

  onStepChange?.(PROCESSING_STEPS.map((step) => ({ ...step, state: 'completed' })));
  await delay(300);

  const pages = randomInt(8, 80);
  const chunks = estimateChunks(pages);

  return buildDocumentFromUpload(file, pages, chunks);
}

function buildDocumentFromUpload(file, pages, chunks) {
  return {
    id: `doc-${uuidv4().slice(0, 8)}`,
    fileName: file.name,
    status: DOCUMENT_STATUS.INDEXED,
    pages,
    fileSize: formatFileSize(file.size),
    fileSizeBytes: file.size,
    chunks,
    uploadedAt: format(new Date(), 'MMMM d, yyyy h:mm a'),
    embeddingModel: DEFAULT_EMBEDDING_MODEL,
    embeddingDimension: DEFAULT_EMBEDDING_DIMENSION,
    retrievalMode: DEFAULT_RETRIEVAL_MODE,
    topK: DEFAULT_TOP_K,
    scoreThreshold: DEFAULT_SCORE_THRESHOLD,
    rerankModel: DEFAULT_RERANK_MODEL,
  };
}

const GENERIC_CITATIONS = ['Page 2', 'Page 6', 'Executive Summary', 'Financial Overview'];

function buildResponse(content, citations = GENERIC_CITATIONS) {
  return { answer: content, citations, latency: `${randomInt(900, 1500)}ms` };
}

export async function askQuestion(_documentId, question) {
  const q = question.toLowerCase();
  await delay(randomInt(900, 1500));

  if (q.includes('summary') || q.includes('summarize')) {
    return buildResponse(
      'Certainly! Here is a summary of the active document. The report highlights strong financial performance, driven by revenue growth, operational efficiency, and strategic investments. It also outlines key market trends, business segment results, sustainability initiatives, and outlook for the coming year.',
      ['Executive Summary', 'Page 2', 'Page 4', '+1 more'],
    );
  }

  if (q.includes('risk')) {
    return buildResponse(
      `Here are the key risks identified in the document:

• Market volatility and competitive pressure in core segments.
• Regulatory changes affecting international operations.
• Supply chain disruptions and input cost inflation.
• Cybersecurity and data privacy exposure.
• Talent retention in high-growth regions.`,
      ['Page 18', 'Page 19', 'Risk Factors', 'Page 21'],
    );
  }

  if (q.includes('recommendation')) {
    return buildResponse(
      `Based on the document, the main recommendations include:

• Continue investing in R&D and AI-driven product capabilities.
• Expand presence in high-growth international markets.
• Accelerate sustainability initiatives to meet 2030 targets.
• Strengthen operational resilience through supply chain diversification.
• Maintain disciplined capital allocation with focus on shareholder returns.`,
      ['Page 22', 'Page 24', 'Recommendations', 'Page 26'],
    );
  }

  if (q.includes('finding') || q.includes('main')) {
    return buildResponse(
      `Here are the main findings from the document:

• Revenue increased 18% YoY, driven by core product growth.
• Operating margin improved due to cost optimization initiatives.
• Strong performance in international markets.
• Sustainability goals remain on track.
• Continued growth expected with investments in R&D and AI.`,
      ['Page 6', 'Page 7', 'Page 10', 'Page 14'],
    );
  }

  if (q.includes('attention') || q.includes('executive')) {
    return buildResponse(
      'The document emphasizes monitoring margin trends, international expansion pace, and sustainability milestones. Executive leadership highlights AI investment as a strategic priority for the next fiscal cycle.',
      ['Page 3', 'Executive Summary', 'Page 8', 'Page 12'],
    );
  }

  return buildResponse(
    'I found relevant passages in the active document. Based on the retrieved context, the document suggests that the main point relates to sustained growth, operational efficiency, and strategic investments aligned with long-term market opportunities.',
    GENERIC_CITATIONS,
  );
}

export async function clearWorkspace() {
  await delay(300);
  return { status: 'cleared' };
}
