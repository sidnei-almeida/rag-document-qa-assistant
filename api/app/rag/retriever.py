from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Optional

from langchain_community.vectorstores import FAISS

from app.config import RETRIEVAL_FETCH_K, RETRIEVAL_K, RETRIEVAL_LAMBDA, RETRIEVAL_TYPE
from app.rag.embeddings import get_embeddings
from app.registry.store import registry

logger = logging.getLogger(__name__)

_vectorstore_cache: dict[str, FAISS] = {}


def invalidate_vectorstore(document_id: str) -> None:
    _vectorstore_cache.pop(document_id, None)


def load_vectorstore(document_id: str) -> FAISS:
    if document_id in _vectorstore_cache:
        return _vectorstore_cache[document_id]

    meta = registry.get_document(document_id)
    if not meta:
        raise FileNotFoundError(f"Document not found: {document_id}")

    index_path = Path(meta["index_path"])
    if not (index_path / "index.faiss").exists():
        raise FileNotFoundError(f"FAISS index missing for {document_id}")

    embeddings = get_embeddings()
    vs = FAISS.load_local(
        str(index_path),
        embeddings,
        allow_dangerous_deserialization=True,
    )
    _vectorstore_cache[document_id] = vs
    return vs


def get_retriever(document_id: str):
    vs = load_vectorstore(document_id)
    search_kwargs: dict[str, Any] = {"k": RETRIEVAL_K}
    if RETRIEVAL_TYPE.lower() == "mmr":
        search_kwargs = {
            "k": RETRIEVAL_K,
            "fetch_k": RETRIEVAL_FETCH_K,
            "lambda_mult": RETRIEVAL_LAMBDA,
        }
        return vs.as_retriever(search_type="mmr", search_kwargs=search_kwargs)
    return vs.as_retriever(search_kwargs=search_kwargs)
