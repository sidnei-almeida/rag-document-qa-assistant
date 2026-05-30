# DocMind API Server

Node.js/Express API that mirrors the legacy Hugging Face Space contract. **RAG logic is mocked** in this phase — no PDF parsing, embeddings, or LLM calls yet.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health + `index_ready` |
| `POST` | `/upload?replace=true\|false` | PDF upload (multipart `file`) |
| `POST` | `/ask` | `{ "question": "..." }` |
| `DELETE` | `/clear` | Reset in-memory index |

## Run

```bash
# from repo root
npm run dev:server
```

Default port: **3001** (`PORT` env overrides).

## Next steps

- PDF text extraction (pdf-parse / pdfjs)
- Embedding provider + vector store
- LLM generation with retrieved chunks
- Persistent storage for documents and sessions
