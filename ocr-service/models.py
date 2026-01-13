"""
Pydantic models for request/response validation.
Ensures type safety and clear API contracts.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class VerifyItemRequest(BaseModel):
    """
    Request model for item verification.
    
    Attributes:
        item_name: The shopping list item name (e.g., "mlijeko")
        image_base64: Base64-encoded image of the price tag (PNG/JPEG)
    """
    # Allow both snake_case and camelCase from clients
    model_config = ConfigDict(populate_by_name=True)
    
    item_name: str = Field(
        ..., 
        min_length=1, 
        max_length=200,
        alias="itemName",
        description="Shopping item name from the list (e.g., 'mlijeko', 'kruh')"
    )
    image_base64: str = Field(
        ..., 
        min_length=100,  # Reasonable minimum for a base64 image
        alias="imageBase64",
        description="Base64-encoded image of the price tag"
    )


class VerifyItemResponse(BaseModel):
    """
    Response model for item verification.
    
    Attributes:
        is_match: Whether the OCR text semantically matches the item name
        confidence: Confidence score between 0.0 and 1.0
        ocr_text: Raw text extracted from the image (for debugging/logging)
        extracted_price: Price extracted from OCR text, if detected
        message: Human-readable message explaining the result (in Bosnian)
    """
    # Use camelCase for JSON response (matches frontend expectations)
    model_config = ConfigDict(populate_by_name=True)
    
    is_match: bool = Field(
        ..., 
        alias="isMatch",
        serialization_alias="isMatch",
        description="True if OCR text semantically matches the item name"
    )
    confidence: float = Field(
        ..., 
        ge=0.0, 
        le=1.0,
        description="Confidence score of the match (0.0 to 1.0)"
    )
    ocr_text: str = Field(
        ..., 
        alias="ocrText",
        serialization_alias="ocrText",
        description="Raw text extracted from the image via OCR"
    )
    extracted_price: Optional[str] = Field(
        None, 
        alias="extractedPrice",
        serialization_alias="extractedPrice",
        description="Price extracted from the OCR text, if detected"
    )
    message: str = Field(
        ..., 
        description="Human-readable result message in Bosnian/Croatian"
    )


class OCRResult(BaseModel):
    """
    Internal model for OCR processing results.
    """
    text: str
    confidence: float = 0.0
    extracted_price: Optional[str] = None


class AIVerificationResult(BaseModel):
    """
    Internal model for AI verification results.
    """
    is_match: bool
    confidence: float
    reasoning: str
