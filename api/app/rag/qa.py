from __future__ import annotations

import logging
import re
import time
from typing import Any, Optional

from langchain_core.messages import HumanMessage, SystemMessage

from app.config import (
    EMBEDDING_MODEL,
    GENERAL_QUESTION_PATTERNS,
    GROQ_MODEL,
    RETRIEVAL_K,
    RETRIEVAL_TYPE,
)
from app.rag.llm import get_llm
from app.rag.retriever import get_retriever
from app.registry.store import registry
from app.schemas import AskMetadata, AskResponse, ConfidenceInfo, SourceItem

logger = logging.getLogger(__name__)


def is_general_question(question: str) -> bool:
    q = question.strip().lower()
    if len(q) <= 40:
        for pattern in GENERAL_QUESTION_PATTERNS:
            if q == pattern or q.startswith(pattern + " ") or q.startswith(pattern + "!"):
                return True
    if re.match(r"^(hi|hello|hey)[\s!.?]*$", q):
        return True
    return False


def _doc_to_source(doc: Any, meta: dict[str, Any], score: Optional[float] = None) -> SourceItem:
    document_id = meta["document_id"]
    filename = meta.get("filename") or meta.get("file_name") or ""
    page_index = doc.metadata.get("page_index", doc.metadata.get("page", 0))
    if isinstance(page_index, int) and page_index >= 0:
        page_display = page_index + 1
    else:
        page_display = 1
        page_index = 0

    preview = (doc.page_content or "")[:280].replace("\n", " ")

    return SourceItem(
        document_id=document_id,
        document=filename,
        filename=filename,
        file_name=filename,
        page=page_display,
        page_index=page_index,
        chunk_id=doc.metadata.get("chunk_id"),
        score=score,
        preview=preview,
        text=doc.page_content,
    )


def _filter_sources(sources: list[SourceItem], document_id: str) -> list[SourceItem]:
    filtered: list[SourceItem] = []
    for src in sources:
        sid = src.document_id or document_id
        if sid != document_id:
            continue
        if not src.document_id:
            src.document_id = document_id
        filtered.append(src)
    return filtered


def answer_question(question: str, document_id: str) -> AskResponse:
    start = time.perf_counter()
    meta = registry.get_document(document_id)
    if not meta:
        raise KeyError(document_id)

    llm = get_llm()
    filename = meta.get("filename", "")

    if is_general_question(question):
        system = (
            "You are DocMind, a helpful document intelligence assistant. "
            "Respond briefly and professionally. "
            f"The user is viewing document: {filename}."
        )
        response = llm.invoke(
            [SystemMessage(content=system), HumanMessage(content=question)]
        )
        latency_ms = int((time.perf_counter() - start) * 1000)
        return AskResponse(
            answer=response.content or "",
            document_id=document_id,
            sources=[],
            confidence=ConfidenceInfo(
                label="medium",
                reason="General conversational question — retrieval skipped.",
            ),
            retrieval_used=False,
            latency_ms=latency_ms,
            model=GROQ_MODEL,
            metadata=AskMetadata(
                model=GROQ_MODEL,
                retrieval_k=0,
                chunks_used=0,
                embedding_model=EMBEDDING_MODEL,
            ),
        )

    retriever = get_retriever(document_id)
    docs = retriever.invoke(question)

    sources: list[SourceItem] = []
    for doc in docs:
        score = doc.metadata.get("score")
        sources.append(_doc_to_source(doc, meta, score=score))

    sources = _filter_sources(sources, document_id)

    context_parts = []
    for i, doc in enumerate(docs, 1):
        page = doc.metadata.get("page_index", 0)
        context_parts.append(
            f"[{i}] (page {int(page) + 1}) {doc.page_content}"
        )
    context = "\n\n".join(context_parts)

    system = (
        "You are DocMind, a document Q&A assistant. "
        "Answer ONLY using the provided context from the document. "
        "If the context is insufficient, say so clearly. "
        "Be concise and factual."
    )
    user = f"Context from {filename}:\n\n{context}\n\nQuestion: {question}"

    response = llm.invoke(
        [SystemMessage(content=system), HumanMessage(content=user)]
    )
    latency_ms = int((time.perf_counter() - start) * 1000)

    label = "high" if len(sources) >= 3 else "medium" if sources else "low"
    reason = (
        f"Answer based on {len(sources)} retrieved passages."
        if sources
        else "No passages retrieved."
    )

    return AskResponse(
        answer=response.content or "",
        document_id=document_id,
        sources=sources,
        confidence=ConfidenceInfo(label=label, reason=reason),
        retrieval_used=True,
        latency_ms=latency_ms,
        model=GROQ_MODEL,
        metadata=AskMetadata(
            model=GROQ_MODEL,
            retrieval_k=RETRIEVAL_K,
            chunks_used=len(sources),
            embedding_model=EMBEDDING_MODEL,
        ),
    )
