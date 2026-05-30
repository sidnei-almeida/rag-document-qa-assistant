from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class SourceItem(BaseModel):
    document_id: Optional[str] = None
    document: Optional[str] = None
    filename: Optional[str] = None
    page: Optional[int] = None
    page_index: Optional[int] = None
    chunk_id: Optional[str | int] = None
    score: Optional[float] = None
    preview: Optional[str] = None
    text: Optional[str] = None
    file_name: Optional[str] = None  # legacy alias


class ConfidenceInfo(BaseModel):
    label: Literal["high", "medium", "low"] = "medium"
    reason: str = ""


class AskMetadata(BaseModel):
    model: str
    retrieval_k: int
    chunks_used: int
    embedding_model: str


class AskRequest(BaseModel):
    question: str
    document_id: Optional[str] = None


class AskResponse(BaseModel):
    answer: str
    document_id: str
    sources: list[SourceItem] = Field(default_factory=list)
    confidence: ConfidenceInfo
    retrieval_used: bool = False
    latency_ms: int = 0
    model: Optional[str] = None
    metadata: Optional[AskMetadata] = None


class DocumentSummary(BaseModel):
    document_id: str
    filename: str
    pages: Optional[int] = None
    chunks: Optional[int] = None
    status: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    is_default: bool = False
    index_ready: bool = False


class DocumentListResponse(BaseModel):
    documents: list[DocumentSummary]


class DocumentDetailResponse(BaseModel):
    document_id: str
    filename: str
    original_filename: Optional[str] = None
    pages: Optional[int] = None
    chunks: Optional[int] = None
    status: str
    index_ready: bool = False
    index_path: Optional[str] = None
    embedding_model: Optional[str] = None
    llm_model: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    is_default: bool = False


class UploadResponse(BaseModel):
    document_id: str
    filename: str
    pages: int
    chunks: int
    status: str
    index_ready: bool = False
    message: str = "Document uploaded and indexed successfully"


class SampleLoadResponse(BaseModel):
    document_id: str
    status: str
    already_loaded: bool
    index_ready: bool
    document: Optional[dict[str, Any]] = None


class HealthResponse(BaseModel):
    status: str = "ok"
    api_ready: bool = False
    llm_ready: bool = False
    embeddings_ready: bool = False
    storage_ready: bool = False
    documents_ready: bool = False
    document_count: int = 0
    default_document_id: Optional[str] = None
    errors: list[str] = Field(default_factory=list)
    # legacy fields
    index_ready: bool = False
    index_path: Optional[str] = None
    model: Optional[str] = None
    embedding_model: Optional[str] = None
    retrieval: Optional[dict[str, Any]] = None
    limits: Optional[dict[str, Any]] = None


class RootResponse(BaseModel):
    name: str = "DocMind API"
    status: str = "DocMind API online"
    api_ready: bool = False
    llm_ready: bool = False
    documents_ready: bool = False
    document_count: int = 0
    default_document_id: Optional[str] = None
    version: str = ""
    endpoints: list[str] = Field(default_factory=list)
    health: str = "ok"
    index_ready: bool = False


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    document_id: Optional[str] = None
    available_documents: Optional[list[str]] = None
    status: Optional[str] = None
