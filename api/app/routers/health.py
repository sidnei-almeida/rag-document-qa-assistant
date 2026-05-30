from __future__ import annotations

from fastapi import APIRouter

from app.config import (
    API_VERSION,
    EMBEDDING_MODEL,
    GROQ_MODEL,
    MAX_FILE_SIZE_MB,
    MAX_PAGES,
    MAX_QUESTION_LENGTH,
    RETRIEVAL_FETCH_K,
    RETRIEVAL_K,
    RETRIEVAL_LAMBDA,
    RETRIEVAL_TYPE,
)
from app.rag import embeddings as emb_service
from app.rag import llm as llm_service
from app.registry.store import registry
from app.schemas import DocumentSummary, HealthResponse, RootResponse

router = APIRouter(tags=["health"])


def _build_health() -> HealthResponse:
    errors: list[str] = []
    if not llm_service.llm_ready():
        errors.append(llm_service.llm_error() or "LLM not ready")
    if not emb_service.embeddings_ready():
        errors.append(emb_service.embeddings_error() or "Embeddings not ready")

    docs = registry.list_documents()
    default_id = registry.get_default_document_id()
    default_meta = registry.get_document(default_id) if default_id else None
    index_ready = bool(default_meta and default_meta.get("index_ready"))

    return HealthResponse(
        status="ok" if not errors else "degraded",
        api_ready=llm_service.llm_ready() and emb_service.embeddings_ready(),
        llm_ready=llm_service.llm_ready(),
        embeddings_ready=emb_service.embeddings_ready(),
        storage_ready=True,
        documents_ready=len(docs) > 0 and any(d.get("index_ready") for d in docs),
        document_count=len(docs),
        default_document_id=default_id,
        errors=errors,
        index_ready=index_ready,
        index_path=default_meta.get("index_path") if default_meta else None,
        model=GROQ_MODEL,
        embedding_model=EMBEDDING_MODEL,
        retrieval={
            "type": RETRIEVAL_TYPE,
            "k": RETRIEVAL_K,
            "fetch_k": RETRIEVAL_FETCH_K,
            "lambda": RETRIEVAL_LAMBDA,
        },
        limits={
            "max_file_size_mb": MAX_FILE_SIZE_MB,
            "max_pages": MAX_PAGES,
            "max_question_length": MAX_QUESTION_LENGTH,
        },
    )


@router.get("/", response_model=RootResponse)
def home() -> RootResponse:
    h = _build_health()
    return RootResponse(
        name="DocMind API",
        status="DocMind API online",
        api_ready=h.api_ready,
        llm_ready=h.llm_ready,
        documents_ready=h.documents_ready,
        document_count=h.document_count,
        default_document_id=h.default_document_id,
        version=API_VERSION,
        health="ok",
        index_ready=h.index_ready,
        endpoints=[
            "/ask (POST) - Ask questions about documents",
            "/documents (GET) - List documents",
            "/documents/upload (POST) - Upload and index PDF",
            "/documents/{document_id} (GET|DELETE) - Document metadata",
            "/demo/load-sample (POST) - Load bundled demo PDF",
            "/health (GET) - Health and limits",
            "/status (GET) - Index and document state",
            "/clear (DELETE) - Clear default document index (legacy)",
        ],
    )


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return _build_health()


@router.get("/status")
def status() -> dict:
    """Legacy-compatible status with multi-document fields."""
    h = _build_health()
    default_id = h.default_document_id
    meta = registry.get_document(default_id) if default_id else None
    docs = registry.list_documents()

    payload = {
        "status": "ok",
        "api_ready": h.api_ready,
        "llm_ready": h.llm_ready,
        "index_ready": bool(meta and meta.get("index_ready")),
        "document_loaded": bool(meta and meta.get("index_ready")),
        "document_id": default_id,
        "file_name": meta.get("filename") if meta else None,
        "filename": meta.get("filename") if meta else None,
        "pages": meta.get("pages") if meta else None,
        "chunks": meta.get("chunks") if meta else None,
        "document_count": h.document_count,
        "default_document_id": default_id,
        "model": GROQ_MODEL,
        "embedding_model": EMBEDDING_MODEL,
        "index_path": meta.get("index_path") if meta else None,
        "retrieval": h.retrieval,
        "limits": h.limits,
        "documents": [
            DocumentSummary(
                document_id=d["document_id"],
                filename=d.get("filename", ""),
                pages=d.get("pages"),
                chunks=d.get("chunks"),
                status=d.get("status", "missing"),
                created_at=d.get("created_at"),
                updated_at=d.get("updated_at"),
                is_default=bool(d.get("is_default")),
                index_ready=bool(d.get("index_ready")),
            ).model_dump()
            for d in docs
        ],
    }
    return payload
