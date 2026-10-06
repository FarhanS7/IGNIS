"""Application configuration settings (PRD v1.1 | ARCHITECTURE.md §4)."""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """IGNIS API runtime configuration."""
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "IGNIS API"
    VERSION: str = "1.1.0"
    ENVIRONMENT: str = "development"

    # Supabase (Optional in dev/test, fallback to JSON fixtures)
    SUPABASE_URL: str | None = None
    SUPABASE_ANON_KEY: str | None = None
    SUPABASE_SERVICE_ROLE_KEY: str | None = None

    # Google Gemini
    GEMINI_API_KEY: str | None = None

    # NASA Open Data API
    NASA_API_KEY: str = "DEMO_KEY"

    # Data paths
    FIXTURES_DIR: Path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "fixtures"


settings = Settings()
