# DocMind — RAG Workspace Assistant

Document intelligence for isolated PDF workspaces.

## Stack

- Frontend: React + Vite
- Vector store: FAISS
- LLM: Llama 3.3 70B via Groq
- Embeddings: all-MiniLM-L6-v2

## Development

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Deploy

Connect repo to Vercel. Set environment variables in Vercel dashboard matching `.env.example`.

Vercel will auto-detect Vite and run `vite build` with output from `/dist`.

### Environment variables

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | HF Space URL (default: `https://salmeida-my-rag-chatbot.hf.space`). O frontend chama a API diretamente no Hugging Face. |
| `VITE_APP_NAME` | Display name (default: DocMind). |

Para mock local com `npm run dev:all`, use `VITE_API_URL=/api` e `VITE_API_PROXY_TARGET=http://localhost:3001`.
