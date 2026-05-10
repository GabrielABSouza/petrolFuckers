import os
from pathlib import Path

from dotenv import load_dotenv

ROOT_API = Path(__file__).resolve().parents[2]
ENV_PATH = ROOT_API / ".env"
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)


class Config:
    GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.environ.get("GEMINI_MODEL", "gemini-3-flash-preview")
    GEMINI_FILE_SEARCH_STORE_ID: str = os.environ.get("GEMINI_FILE_SEARCH_STORE_ID", "")
    API_BASE_URL: str = os.environ.get("API_BASE_URL", "http://localhost:8000")

    @classmethod
    def assert_ready(cls) -> None:
        missing = []
        if not cls.GEMINI_API_KEY:
            missing.append("GEMINI_API_KEY")
        if not cls.GEMINI_FILE_SEARCH_STORE_ID:
            missing.append("GEMINI_FILE_SEARCH_STORE_ID")
        if missing:
            raise RuntimeError(
                f"agente: env vars faltando: {', '.join(missing)}. "
                f"Copie .env.example pra .env e preencha."
            )


config = Config()
