from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas import ErrorResponse, SampleLoadResponse
from app.services.demo_loader import load_all_demo_documents
from app.services.sample_loader import load_sample_document

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("/load-sample", response_model=SampleLoadResponse)
def load_sample() -> SampleLoadResponse:
    try:
        results = load_all_demo_documents(force=False)
        default = next(
            (r for r in results if r.get("document_id")),
            load_sample_document(force=False),
        )
        if not default and results:
            default = results[0]
        result = default or load_sample_document(force=False)
        return SampleLoadResponse(
            document_id=result["document_id"],
            status=result.get("status", "ready"),
            already_loaded=result.get("already_loaded", False),
            index_ready=result.get("index_ready", False),
            document={
                "file_name": result.get("filename"),
                "pages": result.get("pages"),
                "chunks": result.get("chunks"),
            },
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                error="Failed to load demo documents",
                detail=str(exc),
            ).model_dump(),
        ) from exc
