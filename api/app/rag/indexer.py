from __future__ import annotations

import hashlib
import json
import logging
import shutil
from pathlib import Path
from typing import Any

from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import (
    CHUNK_OVERLAP,
    CHUNK_SIZE,
    EMBEDDING_MODEL,
    MAX_PAGES,
    SAMPLE_DOCUMENT_ID,
)
from app.rag.embeddings import get_embeddings
from app.registry.store import DocumentRegistry, registry, slugify

logger = logging.getLogger(__name__)


def file_hash(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def make_document_id(filename: str, digest: str) -> str:
    stem = slugify(Path(filename).stem)
    return f"{stem}-{digest[:8]}"


def index_pdf(
    pdf_path: Path,
    original_filename: str,
    *,
    document_id: str | None = None,
    is_default: bool = False,
    source: str = "upload",
    reg: DocumentRegistry = registry,
) -> dict[str, Any]:
    digest = file_hash(pdf_path)
    doc_id = document_id or make_document_id(original_filename, digest)
    doc_dir = reg.document_dir(doc_id)
    if doc_dir.exists():
        shutil.rmtree(doc_dir)
    doc_dir.mkdir(parents=True, exist_ok=True)

    source_path = doc_dir / "source.pdf"
    shutil.copy2(pdf_path, source_path)

    index_dir = doc_dir / "faiss_index"
    index_dir.mkdir(parents=True, exist_ok=True)

    doc_source = "sample" if (is_default or doc_id == SAMPLE_DOCUMENT_ID) else source

    meta_partial = {
        "document_id": doc_id,
        "filename": original_filename,
        "original_filename": original_filename,
        "file_path": str(source_path),
        "status": "processing",
        "index_path": str(index_dir),
        "file_hash": digest,
        "is_default": is_default or doc_id == SAMPLE_DOCUMENT_ID,
        "source": doc_source,
        "embedding_model": EMBEDDING_MODEL,
        "index_ready": False,
    }
    reg.add_document(meta_partial)

    loader = PyPDFLoader(str(source_path))
    pages = loader.load()
    if len(pages) > MAX_PAGES:
        pages = pages[:MAX_PAGES]

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )
    splits = splitter.split_documents(pages)

    chunk_records: list[dict[str, Any]] = []
    for i, doc in enumerate(splits):
        page_index = doc.metadata.get("page", 0)
        if isinstance(page_index, int) and page_index > 0:
            page_index = page_index - 1
        chunk_id = f"chunk-{i:03d}"
        doc.metadata.update(
            {
                "document_id": doc_id,
                "filename": original_filename,
                "file_name": original_filename,
                "page": page_index,
                "page_index": page_index,
                "chunk_id": chunk_id,
                "source": original_filename,
            }
        )
        chunk_records.append(
            {
                "chunk_id": chunk_id,
                "document_id": doc_id,
                "filename": original_filename,
                "page": page_index,
                "page_index": page_index,
                "text": doc.page_content[:500],
            }
        )

    embeddings = get_embeddings()
    vectorstore = FAISS.from_documents(splits, embeddings)
    vectorstore.save_local(str(index_dir))

    (doc_dir / "chunks.json").write_text(
        json.dumps(chunk_records, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    page_count = len(pages)
    final_meta = {
        **meta_partial,
        "pages": page_count,
        "chunks": len(chunk_records),
        "status": "ready",
        "index_ready": True,
    }
    reg.add_document(final_meta)
    logger.info(
        "Indexed %s: %d pages, %d chunks -> %s",
        doc_id,
        page_count,
        len(chunk_records),
        index_dir,
    )
    return final_meta
