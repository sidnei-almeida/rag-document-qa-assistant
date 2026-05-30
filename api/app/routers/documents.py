from __future__ import annotations

import logging
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import EMBEDDING_MODEL, GROQ_MODEL, MAX_FILE_SIZE_MB
from app.rag.indexer import file_hash, index_pdf, make_document_id
from app.rag.retriever import invalidate_vectorstore
from app.registry.store import registry
from app.schemas import (
    DocumentDetailResponse,
    DocumentListResponse,
    DocumentSummary,
    ErrorResponse,
    UploadResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["documents"])

PDF_CONTENT_TYPES = frozenset(
    {
        "application/pdf",
        "application/x-pdf",
        "application/acrobat",
        "applications/vnd.pdf",
        "text/pdf",
        "text/x-pdf",
    }
)


def _to_summary(meta: dict) -> DocumentSummary:
    return DocumentSummary(
        document_id=meta["document_id"],
        filename=meta.get("filename") or meta.get("original_filename") or "",
        pages=meta.get("pages"),
        chunks=meta.get("chunks"),
        status=meta.get("status", "missing"),
        created_at=meta.get("created_at"),
        updated_at=meta.get("updated_at"),
        is_default=bool(meta.get("is_default")),
        index_ready=bool(meta.get("index_ready")),
    )


def _validate_pdf_upload(file: UploadFile, content: bytes) -> None:
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(error="File is required").model_dump(),
        )
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(error="Only PDF files are supported").model_dump(),
        )
    if file.content_type and file.content_type not in PDF_CONTENT_TYPES:
        if "pdf" not in file.content_type.lower():
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(
                    error="Invalid content type; expected application/pdf"
                ).model_dump(),
            )
    if not content.startswith(b"%PDF"):
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(error="File does not appear to be a valid PDF").model_dump(),
        )


@router.get("", response_model=DocumentListResponse)
def list_documents() -> DocumentListResponse:
    """List all indexed documents (uploads and optional demos in storage)."""
    registry.discover_documents()
    docs = registry.list_documents()
    return DocumentListResponse(documents=[_to_summary(m) for m in docs])


@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document(document_id: str) -> DocumentDetailResponse:
    meta = registry.get_document(document_id)
    if not meta:
        raise HTTPException(
            status_code=404,
            detail=ErrorResponse(
                error="Document not found",
                document_id=document_id,
                available_documents=registry.list_document_ids(),
            ).model_dump(),
        )

    return DocumentDetailResponse(
        document_id=meta["document_id"],
        filename=meta.get("filename", ""),
        original_filename=meta.get("original_filename"),
        pages=meta.get("pages"),
        chunks=meta.get("chunks"),
        status=meta.get("status", "missing"),
        index_ready=bool(meta.get("index_ready")),
        index_path=meta.get("index_path"),
        embedding_model=meta.get("embedding_model") or EMBEDDING_MODEL,
        llm_model=GROQ_MODEL,
        created_at=meta.get("created_at"),
        updated_at=meta.get("updated_at"),
        is_default=bool(meta.get("is_default")),
    )


@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)) -> UploadResponse:
    """
    Upload a PDF, index it in an isolated FAISS store, and return document_id.

    Storage layout:
      storage/documents/{document_id}/source.pdf
      storage/documents/{document_id}/metadata.json
      storage/documents/{document_id}/chunks.json
      storage/documents/{document_id}/faiss_index/
    """
    content = await file.read()
    _validate_pdf_upload(file, content)

    max_bytes = MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(
                error=f"File exceeds maximum size of {MAX_FILE_SIZE_MB} MB"
            ).model_dump(),
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(error="Uploaded file is empty").model_dump(),
        )

    tmp_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(content)
            tmp_path = Path(tmp.name)

        digest = file_hash(tmp_path)
        doc_id = make_document_id(file.filename, digest)
        logger.info("Upload received: %s -> document_id=%s", file.filename, doc_id)

        meta = index_pdf(
            tmp_path,
            file.filename,
            document_id=doc_id,
            is_default=False,
            source="upload",
        )
        invalidate_vectorstore(doc_id)
        registry.discover_documents()

        return UploadResponse(
            document_id=meta["document_id"],
            filename=meta["filename"],
            pages=int(meta.get("pages") or 0),
            chunks=int(meta.get("chunks") or 0),
            status=meta.get("status", "ready"),
            index_ready=bool(meta.get("index_ready")),
            message="Document uploaded and indexed successfully",
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Upload failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                error="Failed to process uploaded document",
                detail=str(exc),
            ).model_dump(),
        ) from exc
    finally:
        if tmp_path and tmp_path.exists():
            tmp_path.unlink(missing_ok=True)


@router.delete("/{document_id}")
def delete_document(document_id: str) -> dict:
    try:
        registry.remove_document(document_id)
        invalidate_vectorstore(document_id)
        registry.discover_documents()
        return {
            "status": "deleted",
            "document_id": document_id,
            "message": "Document and index removed",
        }
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(error=str(exc)).model_dump(),
        ) from exc
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=ErrorResponse(
                error="Document not found",
                document_id=document_id,
            ).model_dump(),
        ) from exc
