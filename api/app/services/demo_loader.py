from __future__ import annotations

import logging
from pathlib import Path

from app.config import ASSETS_DIR
from app.rag.indexer import index_pdf
from app.registry.store import registry
from app.services.demo_catalog import DEMO_CATALOG, DemoDocumentSpec

logger = logging.getLogger(__name__)


def _pdf_safe(text: str) -> str:
    """FPDF core fonts are latin-1; normalize common Unicode punctuation."""
    replacements = {
        "\u2013": "-",
        "\u2014": "-",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2265": ">=",
        "\u2264": "<=",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    return text.encode("latin-1", errors="replace").decode("latin-1")


def ensure_demo_pdf(path: Path, sections: tuple[tuple[str, str], ...]) -> Path:
    """Generate a demo PDF from section tuples (title, body) if missing."""
    if path.exists():
        return path
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        from fpdf import FPDF

        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        for title, body in sections:
            pdf.add_page()
            pdf.set_font("Helvetica", "B", 13)
            pdf.multi_cell(0, 7, _pdf_safe(title))
            pdf.ln(3)
            pdf.set_font("Helvetica", size=10)
            pdf.multi_cell(0, 5, _pdf_safe(body))
        pdf.output(str(path))
        logger.info("Generated demo PDF: %s", path)
    except ImportError:
        logger.warning("fpdf not installed; cannot generate %s", path.name)
    return path


def load_demo_document(spec: DemoDocumentSpec, *, force: bool = False) -> dict:
    existing = registry.get_document(spec.document_id)
    if existing and existing.get("index_ready") and not force:
        return {
            "document_id": spec.document_id,
            "filename": spec.filename,
            "status": "ready",
            "already_loaded": True,
            "index_ready": True,
            "pages": existing.get("pages"),
            "chunks": existing.get("chunks"),
        }

    asset_pdf = ASSETS_DIR / spec.filename
    ensure_demo_pdf(asset_pdf, spec.sections)
    if not asset_pdf.exists():
        raise FileNotFoundError(f"Demo PDF not found: {asset_pdf}")

    meta = index_pdf(
        asset_pdf,
        spec.filename,
        document_id=spec.document_id,
        is_default=spec.is_default,
        source="sample",
    )
    if spec.is_default:
        registry.set_default_document(spec.document_id)

    return {
        "document_id": spec.document_id,
        "filename": spec.filename,
        "status": meta.get("status", "ready"),
        "already_loaded": False,
        "index_ready": meta.get("index_ready", False),
        "pages": meta.get("pages"),
        "chunks": meta.get("chunks"),
    }


def load_all_demo_documents(*, force: bool = False) -> list[dict]:
    """Index every catalog demo that is missing or not ready."""
    results: list[dict] = []
    for spec in DEMO_CATALOG:
        try:
            result = load_demo_document(spec, force=force)
            results.append(result)
            logger.info(
                "Demo document %s: status=%s already_loaded=%s",
                spec.document_id,
                result.get("status"),
                result.get("already_loaded"),
            )
        except Exception as exc:
            logger.exception("Failed to load demo %s: %s", spec.document_id, exc)
    registry.discover_documents()
    return results


def ensure_all_demo_pdfs() -> None:
    """Create bundled PDF assets on disk without indexing (fast path for CI)."""
    for spec in DEMO_CATALOG:
        ensure_demo_pdf(ASSETS_DIR / spec.filename, spec.sections)
