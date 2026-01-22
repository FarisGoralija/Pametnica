"""
Configuration management for Vision AI verification service.
All settings are loaded from environment variables for security and flexibility.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Environment variables:
    - OPENAI_API_KEY: API key for OpenAI GPT models
    - OPENAI_MODEL: Model to use (default: gpt-4o-mini)
    - CONFIDENCE_THRESHOLD: Minimum confidence for match (default: 0.6)
    - DEBUG: Enable debug logging (default: False)
    """

    # OpenAI settings
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    # Verification thresholds
    confidence_threshold: float = 0.6

    # Debug mode
    debug: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache to avoid re-reading environment on every request.
    """
    return Settings()
