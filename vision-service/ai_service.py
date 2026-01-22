"""
AI Verification Service Module.
Handles semantic matching between shopping item names and product images.
"""

import base64
import json
import logging
from typing import Optional

from openai import OpenAI

from config import get_settings
from models import AIVerificationResult

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """Ti si AI asistent specijaliziran za verifikaciju kupovine u bosanskom/hrvatskom jeziku.

Tvoj zadatak je utvrditi da li SLIKA proizvoda SEMANTIČKI ODGOVARA traženom artiklu sa liste za kupovinu.

PRAVILA:
1. Koristi SEMANTIČKO podudaranje, NE tačno podudaranje stringova
2. Dozvoli podudaranje po KATEGORIJI: npr. "čokoladica" se podudara sa Snickers, Mars, Bounty
3. Brend ili varijanta nisu obavezni ako je kategorija jasna
4. Ako je slika nejasna, budi umjereno konzervativan, ali tolerantniji nego strogo pravilo
5. Odbij SAMO kada je očigledno drugačija kategorija proizvoda
6. Opis artikla može biti kratak ili općenit (npr. "mlijeko", "kruh", "sok")

KADA ODBITI:
- Samo kada je OČIGLEDNO potpuno druga vrsta proizvoda
- Npr: tražimo "čokoladica", a slika je boca vode

ODGOVORI ISKLJUČIVO U JSON FORMATU:
{
    "is_match": true/false,
    "confidence": 0.0-1.0,
    "reasoning": "Kratko objašnjenje na bosanskom/hrvatskom"
}
"""


class AIVerificationService:
    """
    Service for AI-powered semantic verification of shopping items using images.
    """

    def __init__(self) -> None:
        self.settings = get_settings()
        self._client: Optional[OpenAI] = None

    @property
    def client(self) -> OpenAI:
        if self._client is None:
            if not self.settings.openai_api_key:
                raise ValueError(
                    "OpenAI API key not configured. "
                    "Set OPENAI_API_KEY environment variable."
                )
            self._client = OpenAI(api_key=self.settings.openai_api_key)
        return self._client

    def verify_match_from_image(self, item_name: str, image_base64: str) -> AIVerificationResult:
        """
        Verify if the product image semantically matches the shopping item.
        """
        try:
            image_url = self._build_image_url(image_base64)
            user_text = (
                f'Artikal sa liste: "{item_name}"\n\n'
                "Da li slika prikazuje proizvod koji SEMANTIČKI ODGOVARA artiklu?"
            )

            logger.info("Verifying image match for item='%s'", item_name)

            response = self.client.chat.completions.create(
                model=self.settings.openai_model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": user_text},
                            {"type": "image_url", "image_url": {"url": image_url}},
                        ],
                    },
                ],
                temperature=0.2,
                max_tokens=250,
                response_format={"type": "json_object"},
            )

            result_text = response.choices[0].message.content or "{}"
            result_json = json.loads(result_text)

            is_match = bool(result_json.get("is_match", False))
            confidence = float(result_json.get("confidence", 0.0))
            reasoning = str(result_json.get("reasoning", "Nije moguće utvrditi."))

            confidence = max(0.0, min(1.0, confidence))

            logger.info(
                "AI verification complete: match=%s, confidence=%.2f",
                is_match,
                confidence,
            )

            return AIVerificationResult(
                is_match=is_match,
                confidence=confidence,
                reasoning=reasoning,
            )
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse AI response as JSON: %s", exc)
            raise ValueError("AI returned invalid response format") from exc
        except Exception as exc:
            logger.error("AI verification failed: %s", exc)
            raise ValueError(f"AI verification failed: {str(exc)}") from exc

    def _build_image_url(self, image_base64: str) -> str:
        """
        Build a data URL for the base64 image. Detects PNG/JPEG when possible.
        """
        if image_base64.startswith("data:image/"):
            return image_base64

        mime_type = "image/jpeg"
        try:
            image_bytes = base64.b64decode(image_base64, validate=False)
            if image_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
                mime_type = "image/png"
            elif image_bytes.startswith(b"\xff\xd8\xff"):
                mime_type = "image/jpeg"
        except Exception:
            logger.warning("Failed to detect image type, defaulting to JPEG")

        return f"data:{mime_type};base64,{image_base64}"
