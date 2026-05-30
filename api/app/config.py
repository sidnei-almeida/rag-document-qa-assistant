import os
from pathlib import Path

# App root: api/ when running locally; /app on HF Spaces
APP_ROOT = Path(__file__).resolve().parents[1]
_storage_raw = os.getenv("STORAGE_DIR", "storage")
STORAGE_DIR = (
    Path(_storage_raw)
    if Path(_storage_raw).is_absolute()
    else APP_ROOT / _storage_raw
)
DOCUMENTS_DIR = STORAGE_DIR / "documents"
REGISTRY_INDEX_PATH = DOCUMENTS_DIR / "registry.json"
ASSETS_DIR = APP_ROOT / "assets" / "demo"

SAMPLE_DOCUMENT_ID = "sample-ai-document-intelligence-report"
SAMPLE_FILENAME = "ai-document-intelligence-report.pdf"

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

RETRIEVAL_K = int(os.getenv("RETRIEVAL_K", "6"))
RETRIEVAL_FETCH_K = int(os.getenv("RETRIEVAL_FETCH_K", "20"))
RETRIEVAL_LAMBDA = float(os.getenv("RETRIEVAL_LAMBDA", "0.7"))
RETRIEVAL_TYPE = os.getenv("RETRIEVAL_TYPE", "mmr")

TEMPERATURE = float(os.getenv("TEMPERATURE", "0.15"))
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "1024"))
GROQ_TIMEOUT_SEC = float(os.getenv("GROQ_TIMEOUT_SEC", "60"))

MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "8"))
MAX_PAGES = int(os.getenv("MAX_PAGES", "40"))
MAX_QUESTION_LENGTH = int(os.getenv("MAX_QUESTION_LENGTH", "1000"))

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "900"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "120"))

API_VERSION = os.getenv("API_VERSION", "2.0.0-multi")

# Upload-first: do not auto-index all bundled PDFs unless explicitly enabled
AUTO_LOAD_DEMOS = os.getenv("AUTO_LOAD_DEMOS", "false").lower() in ("1", "true", "yes")
# Optional: load only the default sample when storage is empty (HF portfolio convenience)
LOAD_SAMPLE_IF_EMPTY = os.getenv("LOAD_SAMPLE_IF_EMPTY", "false").lower() in (
    "1",
    "true",
    "yes",
)

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,*",
).split(",")

GENERAL_QUESTION_PATTERNS = (
    "hello",
    "hi",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
    "thanks",
    "thank you",
    "how are you",
    "who are you",
    "what can you do",
)
