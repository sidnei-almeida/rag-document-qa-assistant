from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import API_VERSION, AUTO_LOAD_DEMOS, CORS_ORIGINS, LOAD_SAMPLE_IF_EMPTY
from app.rag import embeddings as emb_service
from app.rag import llm as llm_service
from app.registry.store import registry
from app.routers import ask, demo, documents, health, legacy

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("docmind")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("DocMind API starting...")
    registry.ensure_storage()
    emb_service.init_embeddings()
    llm_service.init_llm()

    registry.discover_documents()
    count = len(registry.list_documents())
    logger.info("Found %d indexed document(s) in storage", count)

    if AUTO_LOAD_DEMOS:
        from app.services.demo_catalog import DEMO_CATALOG
        from app.services.demo_loader import load_all_demo_documents

        ready_ids = {
            m["document_id"] for m in registry.list_documents() if m.get("index_ready")
        }
        missing = [s for s in DEMO_CATALOG if s.document_id not in ready_ids]
        if missing:
            logger.info("AUTO_LOAD_DEMOS: indexing %d bundled demo(s)", len(missing))
            try:
                load_all_demo_documents(force=False)
            except Exception as exc:
                logger.exception("Demo auto-load failed: %s", exc)
        registry.discover_documents()
    elif count == 0 and LOAD_SAMPLE_IF_EMPTY:
        from app.services.sample_loader import load_sample_document

        logger.info("Storage empty — loading default sample (LOAD_SAMPLE_IF_EMPTY)")
        try:
            load_sample_document(force=False)
            registry.discover_documents()
        except Exception as exc:
            logger.exception("Sample fallback load failed: %s", exc)
    else:
        logger.info(
            "Upload-first: indexed documents loaded from storage only "
            "(upload via POST /documents/upload)"
        )

    logger.info("DocMind API ready (version %s)", API_VERSION)
    yield
    logger.info("DocMind API shutting down")


def create_app() -> FastAPI:
    app = FastAPI(
        title="DocMind API",
        description="Upload-first multi-document RAG API",
        version=API_VERSION,
        lifespan=lifespan,
    )

    origins = [o.strip() for o in CORS_ORIGINS if o.strip()]
    allow_all = "*" in origins

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if allow_all else origins,
        allow_credentials=not allow_all,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(documents.router)
    app.include_router(ask.router)
    app.include_router(demo.router)
    app.include_router(legacy.router)

    return app


app = create_app()
