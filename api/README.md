# DocMind API (Multi-Document RAG)

FastAPI backend for per-document FAISS indexes, Groq LLM, and Hugging Face embeddings.

## Storage layout

```
storage/
  documents/
    registry.json          # index of document_ids (auto-maintained)
    {document_id}/
      source.pdf             # uploaded bytes
      metadata.json
      chunks.json
      faiss_index/
        index.faiss
        index.pkl
```

**Upload-first (default):** no bundled PDFs on startup. Users send real PDFs via `POST /documents/upload` (`multipart/form-data`, field `file`). The API saves, chunks, embeds, and builds a **per-document** FAISS index under `storage/documents/{document_id}/`.

Bundled PDFs in `api/assets/demo/` are **not** used unless you call `POST /demo/load-sample` or set env flags below.

| Env | Default | Effect |
|-----|---------|--------|
| `AUTO_LOAD_DEMOS` | `false` | Index all bundled demo PDFs on startup |
| `LOAD_SAMPLE_IF_EMPTY` | `false` | If storage is empty, load one sample PDF |

Bundled catalog (when `AUTO_LOAD_DEMOS` or `POST /demo/load-sample`):

| Document ID | Filename |
|-------------|----------|
| `sample-ai-document-intelligence-report` | `ai-document-intelligence-report.pdf` |
| `demo-financial-summary-2025` | `financial-summary-2025.pdf` |
| `demo-clinical-trial-summary` | `clinical-trial-summary.pdf` |
| `demo-market-research-brief` | `market-research-brief.pdf` |

PDF sources live in `api/assets/demo/`. Each document has its own FAISS index under `storage/documents/{document_id}/`.

## Environment variables

| Variable | Default |
|----------|---------|
| `GROQ_API_KEY` | *(required in production)* |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` |
| `EMBEDDING_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` |
| `STORAGE_DIR` | `storage` (under `api/`) |
| `AUTO_LOAD_DEMOS` | `false` |
| `LOAD_SAMPLE_IF_EMPTY` | `false` |
| `CORS_ORIGINS` | `localhost:3000,5173,*` |
| `RETRIEVAL_K` | `6` |
| `RETRIEVAL_TYPE` | `mmr` |
| `TEMPERATURE` | `0.15` |
| `MAX_TOKENS` | `1024` |

## Run locally

```bash
cd api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export GROQ_API_KEY=your_key
cd ..
uvicorn app:app --reload --port 7860
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API overview |
| GET | `/health` | Health + readiness |
| GET | `/status` | Legacy status + document list |
| GET | `/documents` | List all documents |
| GET | `/documents/{id}` | Document metadata |
| POST | `/documents/upload` | Upload & index PDF |
| DELETE | `/documents/{id}` | Delete document (not sample) |
| POST | `/ask` | Question (**`document_id` required**) |
| POST | `/demo/load-sample` | Load bundled sample |
| POST | `/upload` | Legacy upload |
| DELETE | `/clear` | Legacy clear (reload sample) |

## Hugging Face Spaces

- Entry file: `app.py` (repo root)
- `requirements.txt`: copy or symlink from `api/requirements.txt`
- Set `GROQ_API_KEY` in Space secrets
- **Note:** Ephemeral disk — uploads may be lost on Space restart unless persistent storage is enabled.

## Manual tests

```bash
# 1. List documents (empty until upload)
curl -i http://localhost:7860/documents

# 2. Upload a real PDF
curl -i -X POST http://localhost:7860/documents/upload \
  -F "file=@/path/to/your.pdf"

# 3. Ask using document_id from upload response
curl -i -X POST http://localhost:7860/ask \
  -H "Content-Type: application/json" \
  -d '{"document_id":"YOUR_DOCUMENT_ID","question":"What is this document about?"}'

# 4. Missing document
curl -i -X POST http://localhost:7860/ask \
  -H "Content-Type: application/json" \
  -d '{"document_id":"fake","question":"test"}'
```
