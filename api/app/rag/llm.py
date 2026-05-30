from __future__ import annotations

import logging
from typing import Optional

from langchain_groq import ChatGroq

from app.config import GROQ_API_KEY, GROQ_MODEL, GROQ_TIMEOUT_SEC, MAX_TOKENS, TEMPERATURE

logger = logging.getLogger(__name__)

_llm: Optional[ChatGroq] = None
_llm_ready = False
_llm_error: Optional[str] = None


def init_llm() -> bool:
    global _llm, _llm_ready, _llm_error
    if not GROQ_API_KEY:
        _llm_ready = False
        _llm_error = "GROQ_API_KEY is not set"
        logger.error(_llm_error)
        return False
    try:
        logger.info("Connecting to Groq model=%s", GROQ_MODEL)
        _llm = ChatGroq(
            api_key=GROQ_API_KEY,
            model=GROQ_MODEL,
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS,
            timeout=GROQ_TIMEOUT_SEC,
        )
        _llm_ready = True
        _llm_error = None
        return True
    except Exception as exc:
        _llm_ready = False
        _llm_error = str(exc)
        logger.exception("Failed to initialize Groq LLM: %s", exc)
        return False


def get_llm() -> ChatGroq:
    if _llm is None:
        init_llm()
    if _llm is None:
        raise RuntimeError(_llm_error or "LLM not initialized")
    return _llm


def llm_ready() -> bool:
    return _llm_ready


def llm_error() -> Optional[str]:
    return _llm_error
