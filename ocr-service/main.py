"""
OCR + AI Verification Microservice
Main FastAPI application.

This microservice provides:
- OCR text extraction from price tag images
- AI-powered semantic verification of shopping items
- Bosnian/Croatian language support

The service is designed to be:
- Stateless (no image storage)
- Modular (replaceable OCR/AI backends)
- Environment-variable configurable

Endpoints:
- POST /verify: Verify if a price tag image matches a shopping item
- GET /health: Health check endpoint
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from models import VerifyItemRequest, VerifyItemResponse
from ocr_service import OCRService
from ai_service import AIVerificationService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Global service instances (initialized on startup)
ocr_service: OCRService | None = None
ai_service: AIVerificationService | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Initializes services on startup and cleans up on shutdown.
    """
    global ocr_service, ai_service
    
    settings = get_settings()
    
    # Initialize services
    logger.info("Initializing OCR service...")
    ocr_service = OCRService()
    
    logger.info("Initializing AI verification service...")
    ai_service = AIVerificationService()
    
    logger.info(f"Services initialized. OCR language: {settings.ocr_language}")
    logger.info(f"AI model: {settings.openai_model}")
    
    yield
    
    # Cleanup on shutdown
    logger.info("Shutting down services...")
    ocr_service = None
    ai_service = None


# Create FastAPI application
app = FastAPI(
    title="OCR + AI Verification Service",
    description=(
        "Microservice za verifikaciju kupovine putem OCR i AI semantičkog podudaranja. "
        "Podržava bosanski/hrvatski jezik."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    Returns service status and configuration info.
    """
    settings = get_settings()
    return {
        "status": "healthy",
        "ocr_language": settings.ocr_language,
        "ai_model": settings.openai_model,
        "services": {
            "ocr": ocr_service is not None,
            "ai": ai_service is not None
        }
    }


@app.post("/verify", response_model=VerifyItemResponse)
async def verify_item(request: VerifyItemRequest):
    """
    Verify if a price tag image matches a shopping item.
    
    This endpoint:
    1. Receives a base64-encoded image of a price tag
    2. Extracts text using OCR (Tesseract with Croatian language)
    3. Uses AI to semantically verify if the text matches the item name
    4. Returns match result with confidence score
    
    IMPORTANT: Image is processed in-memory only and discarded immediately.
    No image data is stored in the database or file system.
    
    Args:
        request: VerifyItemRequest with item_name and image_base64
        
    Returns:
        VerifyItemResponse with match result, confidence, and OCR text
        
    Raises:
        HTTPException: If OCR or AI processing fails
    """
    settings = get_settings()
    
    if ocr_service is None or ai_service is None:
        raise HTTPException(
            status_code=503,
            detail="Servisi nisu inicijalizirani. Pokušajte ponovo."
        )
    
    try:
        # Step 1: Extract text from image using OCR
        # Image is processed in-memory and discarded after extraction
        logger.info(f"Processing verification request for item: '{request.item_name}'")
        
        ocr_result = ocr_service.process_image(request.image_base64)
        
        if not ocr_result.text.strip():
            # No text extracted - likely not a valid price tag image
            return VerifyItemResponse(
                is_match=False,
                confidence=0.0,
                ocr_text="",
                extracted_price=None,
                message="Nije moguće pročitati tekst sa slike. Molimo pokušajte sa jasnijom slikom."
            )
        
        # Step 2: Use AI to verify semantic match
        try:
            ai_result = ai_service.verify_match(request.item_name, ocr_result.text)
        except ValueError as e:
            # AI service failed - try fallback
            logger.warning(f"AI service failed, using fallback: {e}")
            ai_result = ai_service.verify_match_fallback(request.item_name, ocr_result.text)
        
        # Step 3: Apply confidence threshold
        is_match = ai_result.is_match and ai_result.confidence >= settings.confidence_threshold
        
        # Generate appropriate message in Bosnian
        if is_match:
            message = f"✓ Proizvod potvrđen: '{request.item_name}' odgovara cjenovniku."
        else:
            if ai_result.is_match:
                # Match found but confidence too low
                message = (
                    f"⚠ Nisam siguran da '{request.item_name}' odgovara cjenovniku. "
                    f"Pouzdanost: {ai_result.confidence:.0%}. Molimo provjerite."
                )
            else:
                message = (
                    f"✗ Proizvod '{request.item_name}' NE odgovara cjenovniku. "
                    f"{ai_result.reasoning}"
                )
        
        logger.info(
            f"Verification complete: item='{request.item_name}', "
            f"match={is_match}, confidence={ai_result.confidence:.2f}"
        )
        
        # Return response - image data has already been discarded
        return VerifyItemResponse(
            is_match=is_match,
            confidence=ai_result.confidence,
            ocr_text=ocr_result.text,
            extracted_price=ocr_result.extracted_price,
            message=message
        )
        
    except ValueError as e:
        logger.error(f"Verification failed: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Greška pri obradi slike: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error during verification: {e}")
        raise HTTPException(
            status_code=500,
            detail="Interna greška servera. Molimo pokušajte ponovo."
        )


if __name__ == "__main__":
    import uvicorn
    
    settings = get_settings()
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=settings.debug
    )
