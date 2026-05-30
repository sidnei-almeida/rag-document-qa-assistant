from __future__ import annotations

from dataclasses import dataclass

from app.config import (
    SAMPLE_DOCUMENT_ID,
    SAMPLE_FILENAME,
)
from app.services.demo_content import (
    AI_DOCUMENT_SECTIONS,
    CLINICAL_SECTIONS,
    FINANCIAL_SECTIONS,
    MARKET_SECTIONS,
)


@dataclass(frozen=True)
class DemoDocumentSpec:
    document_id: str
    filename: str
    sections: tuple[tuple[str, str], ...]
    is_default: bool = False
    display_name: str = ""


DEMO_CATALOG: tuple[DemoDocumentSpec, ...] = (
    DemoDocumentSpec(
        document_id=SAMPLE_DOCUMENT_ID,
        filename=SAMPLE_FILENAME,
        sections=tuple(AI_DOCUMENT_SECTIONS),
        is_default=True,
        display_name="AI Document Intelligence Report",
    ),
    DemoDocumentSpec(
        document_id="demo-financial-summary-2025",
        filename="financial-summary-2025.pdf",
        sections=tuple(FINANCIAL_SECTIONS),
        display_name="Financial Summary 2025",
    ),
    DemoDocumentSpec(
        document_id="demo-clinical-trial-summary",
        filename="clinical-trial-summary.pdf",
        sections=tuple(CLINICAL_SECTIONS),
        display_name="Clinical Trial Summary",
    ),
    DemoDocumentSpec(
        document_id="demo-market-research-brief",
        filename="market-research-brief.pdf",
        sections=tuple(MARKET_SECTIONS),
        display_name="Market Research Brief",
    ),
)
