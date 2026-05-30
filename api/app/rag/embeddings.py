from __future__ import annotations

import logging
from functools import lru_cache
from typing import Optional

from langchain_huggingface import HuggingFaceEmbeddings

from app.config import EMBEDDING_MODEL

logger = logging.getLogger(__name__)

_embeddings: Optional[HuggingFaceEmbeddings] = None
_embeddings_ready = False
_embeddings_error: Optional[str] = None


def init_embeddings() -> bool:
    global _embeddings, _embeddings_ready, _embeddings_error
    try:
        logger.info("Loading embeddings model: %s", EMBEDDING_MODEL)
        _embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
        _embeddings_ready = True
        _embeddings_error = None
        return True
    except Exception as exc:
        _embeddings_ready = False
        _embeddings_error = str(exc)
        logger.exception("Failed to load embeddings: %s", exc)
        return False


def get_embeddings() -> HuggingFaceEmbeddings:
    if _embeddings is None:
        init_embeddings()
    if _embeddings is None:
        raise RuntimeError(_embeddings_error or "Embeddings not initialized")
    return _embeddings


def embeddings_ready() -> bool:
    return _embeddings_ready


def embeddings_error() -> Optional[str]:
    return _embeddings_error
