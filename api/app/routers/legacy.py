from __future__ import annotations

import logging
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import MAX_FILE_SIZE_MB, SAMPLE_DOCUMENT_ID
from app.rag.indexer import index_pdf, file_hash
from app.rag.retriever import invalidate_vectorstore
from app.registry.store import registry
from app.schemas import ErrorResponse
from app.services.sample_loader import load_sample_document

logger = logging.getLogger(__name__)
router = APIRouter(tags=["legacy"])


@router.post("/upload")
async def upload_pdf_legacy(
    file: UploadFile = File(...),
    replace: bool = True,
) -> dict:
    """Legacy upload endpoint — indexes as a new document (uses filename hash id)."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large")

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)

    try:
        if replace:
            default_id = registry.get_default_document_id() or SAMPLE_DOCUMENT_ID
            try:
                registry.remove_document(default_id)
            except ValueError:
                pass
            invalidate_vectorstore(default_id)

        from app.rag.indexer import make_document_id

        digest = file_hash(tmp_path)
        doc_id = make_document_id(file.filename, digest)
        meta = index_pdf(tmp_path, file.filename, document_id=doc_id, is_default=True)
        registry.set_default_document(doc_id)
        invalidate_vectorstore(doc_id)
        return {
            "pages": meta.get("pages"),
            "chunks": meta.get("chunks"),
            "fileName": meta.get("filename"),
            "document_id": doc_id,
        }
    finally:
        tmp_path.unlink(missing_ok=True)


@router.delete("/clear")
def clear_index_legacy() -> dict:
    """Legacy clear — re-indexes the bundled sample as default."""
    try:
        load_sample_document(force=True)
        return {"status": "cleared", "index_ready": True}
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(error="Failed to clear index", detail=str(exc)).model_dump(),
        ) from exc
