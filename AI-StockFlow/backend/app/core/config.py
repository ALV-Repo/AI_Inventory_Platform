"""Application configuration (SRS §2.5, §9)."""
import os
from functools import lru_cache


class Settings:
    PROJECT_NAME: str = "AI StockFlow"
    API_V1: str = "/api/v1"

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql+psycopg2://stockflow:stockflow@localhost:5432/stockflow"
    )
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # NFR-07: never hardcode in production — inject from vault/secret manager.
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me-in-production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_MINUTES: int = int(os.getenv("ACCESS_TOKEN_MINUTES", "60"))
    REFRESH_TOKEN_DAYS: int = int(os.getenv("REFRESH_TOKEN_DAYS", "14"))

    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    SEED_DEMO_DATA: bool = os.getenv("SEED_DEMO_DATA", "false").lower() == "true"
    # Dev only: create tables from the models at startup. Production schema is
    # owned by Alembic (see CI/CD pipeline); set false there.
    AUTO_CREATE_SCHEMA: bool = os.getenv("AUTO_CREATE_SCHEMA", "true").lower() == "true"

    # AI gateway (SRS §7.4) — provider is swappable without touching business code.
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "stub")  # stub | anthropic | selfhosted
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")

    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "300"))


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
