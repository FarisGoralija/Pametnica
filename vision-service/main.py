"""
Vision AI Verification Microservice.
Main FastAPI application.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from ai_service import AIVerificationService
from config import get_settings
from models import VerifyItemRequest, VerifyItemResponse

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


vision_service: AIVerificationService | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global vision_service

    settings = get_settings()
    logger.info("Initializing Vision AI verification service...")
    vision_service = AIVerificationService()
    logger.info("Service initialized. AI model: %s", settings.openai_model)

    yield

    logger.info("Shutting down service...")
    vision_service = None


app = FastAPI(
    title="Vision AI Verification Service",
    description=(
        "Microservice za verifikaciju kupovine korištenjem OpenAI vision modela. "
        "Podržava bosanski/hrvatski jezik."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    settings = get_settings()
    return {
        "status": "healthy",
        "ai_model": settings.openai_model,
        "services": {"vision_ai": vision_service is not None},
    }


@app.post("/verify", response_model=VerifyItemResponse)
async def verify_item(request: VerifyItemRequest):
    settings = get_settings()

    if vision_service is None:
        raise HTTPException(
            status_code=503,
            detail="Servis nije inicijaliziran. Pokušajte ponovo.",
        )

    try:
        logger.info("Processing verification request for item: '%s'", request.item_name)
        ai_result = vision_service.verify_match_from_image(
            request.item_name,
            request.image_base64,
        )

        is_match = ai_result.is_match and ai_result.confidence >= settings.confidence_threshold

        if is_match:
            message = f"✓ Proizvod potvrđen: '{request.item_name}' odgovara slici."
        else:
            if ai_result.is_match:
                message = (
                    f"⚠ Nisam siguran da '{request.item_name}' odgovara slici. "
                    f"Pouzdanost: {ai_result.confidence:.0%}. Molimo provjerite."
                )
            else:
                message = (
                    f"✗ Proizvod '{request.item_name}' NE odgovara slici. "
                    f"{ai_result.reasoning}"
                )

        return VerifyItemResponse(
            is_match=is_match,
            confidence=ai_result.confidence,
            ocr_text="",
            extracted_price=None,
            message=message,
        )
    except ValueError as exc:
        logger.error("Verification failed: %s", exc)
        raise HTTPException(
            status_code=400,
            detail=f"Greška pri obradi slike: {str(exc)}",
        ) from exc
    except Exception as exc:
        logger.error("Unexpected error during verification: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="Interna greška servera. Molimo pokušajte ponovo.",
        ) from exc


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=settings.debug,
    )
