"""
Pydantic models for request/response validation.
Ensures type safety and clear API contracts.
"""

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class VerifyItemRequest(BaseModel):
    """
    Request model for item verification.

    Attributes:
        item_name: The shopping list item name (e.g., "mlijeko")
        image_base64: Base64-encoded image of the product (PNG/JPEG)
    """

    model_config = ConfigDict(populate_by_name=True)

    item_name: str = Field(
        ...,
        min_length=1,
        max_length=200,
        alias="itemName",
        validation_alias="item_name",
        description="Shopping item name from the list (e.g., 'mlijeko', 'kruh')",
    )
    image_base64: str = Field(
        ...,
        min_length=100,
        alias="imageBase64",
        validation_alias="image_base64",
        description="Base64-encoded image of the product",
    )


class VerifyItemResponse(BaseModel):
    """
    Response model for item verification.
    Returns snake_case for consistency with .NET backend.
    """

    is_match: bool = Field(..., description="True if image semantically matches the item name")
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score of the match (0.0 to 1.0)",
    )
    ocr_text: str = Field(
        ...,
        description="Text extracted from image (not used in vision-only flow)",
    )
    extracted_price: Optional[str] = Field(
        None,
        description="Price extracted from the image, if detected (not used here)",
    )
    message: str = Field(
        ...,
        description="Human-readable result message in Bosnian/Croatian",
    )


class AIVerificationResult(BaseModel):
    """
    Internal model for AI verification results.
    """

    is_match: bool
    confidence: float
    reasoning: str
