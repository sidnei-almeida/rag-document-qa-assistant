"""Backward-compatible sample loader — delegates to demo catalog."""

from __future__ import annotations

from app.config import SAMPLE_DOCUMENT_ID
from app.services.demo_catalog import DEMO_CATALOG
from app.services.demo_loader import load_demo_document, load_all_demo_documents

# Re-export for scripts/tests
from app.services.demo_loader import ensure_demo_pdf  # noqa: F401
from app.services.demo_content import AI_DOCUMENT_SECTIONS as SAMPLE_SECTIONS  # noqa: F401


def ensure_sample_pdf(path):  # type: ignore[no-untyped-def]
    from app.services.demo_loader import ensure_demo_pdf as _ensure
    from app.services.demo_catalog import DEMO_CATALOG

    spec = DEMO_CATALOG[0]
    return _ensure(path, spec.sections)


def load_sample_document(*, force: bool = False) -> dict:
    spec = DEMO_CATALOG[0]
    return load_demo_document(spec, force=force)


__all__ = [
    "load_sample_document",
    "load_all_demo_documents",
    "SAMPLE_DOCUMENT_ID",
]
