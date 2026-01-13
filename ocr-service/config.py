"""
Configuration management for OCR + AI service.
All settings are loaded from environment variables for security and flexibility.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Environment variables:
    - OPENAI_API_KEY: API key for OpenAI GPT models
    - OPENAI_MODEL: Model to use (default: gpt-4o-mini for cost efficiency)
    - OCR_LANGUAGE: Tesseract language code (default: hrv for Croatian/Bosnian)
    - CONFIDENCE_THRESHOLD: Minimum confidence for match (default: 0.7)
    - DEBUG: Enable debug logging (default: False)
    """
    
    # OpenAI settings
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"  # Cost-efficient, good for semantic matching
    
    # OCR settings
    # hrv = Croatian, also works well for Bosnian as they share Latin script
    ocr_language: str = "hrv"
    
    # Verification thresholds
    # Lower threshold to be more accepting of OCR matches
    confidence_threshold: float = 0.6
    
    # Debug mode
    debug: bool = False
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Allow environment variables to override .env file
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache to avoid re-reading environment on every request.
    """
    return Settings()
