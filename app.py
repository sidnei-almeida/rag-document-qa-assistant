"""
Hugging Face Spaces entrypoint (repo root).
Exposes `app` for: uvicorn app:app --host 0.0.0.0 --port 7860
"""
import sys
from pathlib import Path

_API_DIR = Path(__file__).resolve().parent / "api"
if str(_API_DIR) not in sys.path:
    sys.path.insert(0, str(_API_DIR))

from app.main import app  # noqa: F401
