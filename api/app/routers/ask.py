from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.config import MAX_QUESTION_LENGTH
from app.rag import llm as llm_service
from app.rag.qa import answer_question
from app.registry.store import registry
from app.schemas import AskRequest, AskResponse, ErrorResponse

router = APIRouter(tags=["ask"])


@router.post("/ask", response_model=AskResponse)
def ask_document(body: AskRequest) -> AskResponse:
    question = (body.question or "").strip()
    if not question:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(error="Question cannot be empty").model_dump(),
        )
    if len(question) > MAX_QUESTION_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(
                error=f"Question exceeds maximum length of {MAX_QUESTION_LENGTH} characters"
            ).model_dump(),
        )

    if not llm_service.llm_ready():
        raise HTTPException(
            status_code=502,
            detail=ErrorResponse(
                error="LLM service unavailable",
                detail=llm_service.llm_error(),
            ).model_dump(),
        )

    if not body.document_id:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(
                error="document_id is required",
                detail="Upload a PDF via POST /documents/upload first.",
            ).model_dump(),
        )

    document_id = body.document_id.strip()

    meta = registry.get_document(document_id)
    if not meta:
        raise HTTPException(
            status_code=404,
            detail=ErrorResponse(
                error="Document not found",
                document_id=body.document_id,
                available_documents=registry.list_document_ids(),
            ).model_dump(),
        )

    if not meta.get("index_ready") or meta.get("status") != "ready":
        raise HTTPException(
            status_code=503,
            detail=ErrorResponse(
                error="Document index is not ready",
                document_id=document_id,
                status=meta.get("status", "processing"),
            ).model_dump(),
        )

    try:
        return answer_question(question, document_id)
    except Exception as exc:
        logger_msg = str(exc)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                error="Failed to process question",
                detail=logger_msg,
            ).model_dump(),
        ) from exc
