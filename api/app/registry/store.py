from __future__ import annotations

import json
import logging
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from app.config import DOCUMENTS_DIR, REGISTRY_INDEX_PATH, SAMPLE_DOCUMENT_ID

logger = logging.getLogger(__name__)


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "document"


class DocumentRegistry:
    """
    Per-document storage under storage/documents/{document_id}/.
    Each upload creates source.pdf, metadata.json, chunks.json, faiss_index/.
    """

    def __init__(self, documents_dir: Path = DOCUMENTS_DIR) -> None:
        self.documents_dir = documents_dir
        self.registry_index_path = REGISTRY_INDEX_PATH
        self._default_document_id: Optional[str] = None
        self._cache: dict[str, dict[str, Any]] = {}

    def ensure_storage(self) -> None:
        self.documents_dir.mkdir(parents=True, exist_ok=True)
        logger.info("Storage directory ready: %s", self.documents_dir)

    def document_dir(self, document_id: str) -> Path:
        return self.documents_dir / document_id

    def _write_registry_index(self) -> None:
        """Persist lightweight index for debugging / external tools."""
        try:
            docs = list(self._cache.values()) if self._cache else []
            payload = {
                "updated_at": _utc_now(),
                "document_count": len(docs),
                "default_document_id": self._default_document_id,
                "documents": [
                    {
                        "document_id": m["document_id"],
                        "filename": m.get("filename"),
                        "pages": m.get("pages"),
                        "chunks": m.get("chunks"),
                        "status": m.get("status"),
                        "index_ready": bool(m.get("index_ready")),
                        "source": m.get("source", "upload"),
                        "created_at": m.get("created_at"),
                    }
                    for m in sorted(docs, key=lambda x: x.get("created_at") or "")
                ],
            }
            self.registry_index_path.parent.mkdir(parents=True, exist_ok=True)
            self.registry_index_path.write_text(
                json.dumps(payload, indent=2, ensure_ascii=False),
                encoding="utf-8",
            )
        except Exception as exc:
            logger.warning("Failed to write registry.json: %s", exc)

    def discover_documents(self) -> list[dict[str, Any]]:
        logger.info("Loading document registry from %s", self.documents_dir)
        self._cache.clear()
        if not self.documents_dir.exists():
            logger.info("Found 0 documents")
            self._write_registry_index()
            return []

        found: list[dict[str, Any]] = []
        for child in sorted(self.documents_dir.iterdir()):
            if not child.is_dir():
                continue
            if child.name.startswith("."):
                continue
            meta_path = child / "metadata.json"
            if not meta_path.exists():
                logger.warning("Skipping %s — no metadata.json", child.name)
                continue
            try:
                meta = json.loads(meta_path.read_text(encoding="utf-8"))
                meta["document_id"] = meta.get("document_id") or child.name
                self._validate_index(meta)
                self._cache[meta["document_id"]] = meta
                found.append(meta)
                if meta.get("index_ready"):
                    logger.info("Document %s index ready", meta["document_id"])
                else:
                    logger.info(
                        "Document %s index not ready (%s)",
                        meta["document_id"],
                        meta.get("status", "unknown"),
                    )
            except Exception as exc:
                logger.exception("Failed to load metadata for %s: %s", child.name, exc)

        found.sort(key=lambda m: m.get("created_at") or "")
        logger.info("Found %d document(s)", len(found))

        default = next((m for m in found if m.get("is_default")), None)
        if default:
            self._default_document_id = default["document_id"]
        elif found:
            ready = next((m for m in found if m.get("index_ready")), found[0])
            self._default_document_id = ready["document_id"]
        else:
            self._default_document_id = None

        if self._default_document_id:
            logger.info("Default document: %s", self._default_document_id)

        self._write_registry_index()
        return found

    def _validate_index(self, meta: dict[str, Any]) -> None:
        index_dir = Path(meta.get("index_path", ""))
        if not index_dir.is_absolute():
            index_dir = self.document_dir(meta["document_id"]) / "faiss_index"
            meta["index_path"] = str(index_dir)
        faiss_file = index_dir / "index.faiss"
        pkl_file = index_dir / "index.pkl"
        has_index = faiss_file.exists() and pkl_file.exists()
        if has_index and meta.get("status") == "ready":
            meta["index_ready"] = True
        else:
            meta["index_ready"] = bool(meta.get("index_ready", False)) and has_index

    def list_documents(self) -> list[dict[str, Any]]:
        if not self._cache:
            return self.discover_documents()
        return list(self._cache.values())

    def get_document(self, document_id: str) -> Optional[dict[str, Any]]:
        if document_id in self._cache:
            return self._cache[document_id]
        meta_path = self.document_dir(document_id) / "metadata.json"
        if not meta_path.exists():
            return None
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        meta["document_id"] = document_id
        self._validate_index(meta)
        self._cache[document_id] = meta
        return meta

    def add_document(self, meta: dict[str, Any]) -> dict[str, Any]:
        document_id = meta["document_id"]
        doc_dir = self.document_dir(document_id)
        doc_dir.mkdir(parents=True, exist_ok=True)
        meta.setdefault("created_at", _utc_now())
        meta["updated_at"] = _utc_now()
        meta.setdefault("source", "upload")
        (doc_dir / "metadata.json").write_text(
            json.dumps(meta, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        self._cache[document_id] = meta
        if meta.get("is_default"):
            self._default_document_id = document_id
        self._write_registry_index()
        return meta

    def update_document(self, document_id: str, **fields: Any) -> dict[str, Any]:
        meta = self.get_document(document_id)
        if not meta:
            raise KeyError(document_id)
        meta.update(fields)
        meta["updated_at"] = _utc_now()
        return self.add_document(meta)

    def remove_document(self, document_id: str) -> bool:
        if document_id == SAMPLE_DOCUMENT_ID:
            raise ValueError("Cannot delete the default sample document")
        doc_dir = self.document_dir(document_id)
        if not doc_dir.exists():
            raise FileNotFoundError(document_id)
        shutil.rmtree(doc_dir)
        self._cache.pop(document_id, None)
        if self._default_document_id == document_id:
            self._default_document_id = None
            remaining = self.list_documents()
            if remaining:
                self._default_document_id = remaining[0]["document_id"]
        self._write_registry_index()
        return True

    def get_default_document_id(self) -> Optional[str]:
        return self._default_document_id

    def set_default_document(self, document_id: str) -> None:
        for meta in self.list_documents():
            meta["is_default"] = meta["document_id"] == document_id
            self.add_document(meta)
        self._default_document_id = document_id

    def resolve_document_id(self, document_id: Optional[str]) -> Optional[str]:
        if document_id:
            return document_id
        return self._default_document_id

    def list_document_ids(self) -> list[str]:
        return [m["document_id"] for m in self.list_documents()]


registry = DocumentRegistry()
