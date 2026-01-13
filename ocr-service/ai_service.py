"""
AI Verification Service Module.
Handles semantic matching between shopping item names and OCR-extracted text.

Uses OpenAI GPT for intelligent semantic matching in Bosnian/Croatian language.
The service is designed to:
- Handle linguistic variations (mlijeko vs punomasno mlijeko 2.7%)
- Understand product categories and synonyms
- Return structured, consistent responses
"""

import json
import logging
from typing import Optional

from openai import OpenAI

from config import get_settings
from models import AIVerificationResult

logger = logging.getLogger(__name__)


# System prompt for semantic matching
# Enforces Bosnian/Croatian language understanding and structured output
SYSTEM_PROMPT = """Ti si AI asistent specijaliziran za verifikaciju kupovine u bosanskom/hrvatskom jeziku.

Tvoj zadatak je utvrditi da li tekst sa cjenovnika/etikete proizvoda SEMANTIČKI ODGOVARA traženom artiklu sa liste za kupovinu.

PRAVILA:
1. Koristi SEMANTIČKO podudaranje, NE tačno podudaranje stringova
2. "mlijeko" se podudara sa "Svježe punomasno mlijeko 2.7%" (isti proizvod, različiti opisi)
3. "kruh" se podudara sa "Bijeli kruh 500g" ili "Domaći kruh"
4. "jogurt" se podudara sa "Jogurt voćni 150g" ili "Meggle jogurt"
5. NE podudara se ako je potpuno drugačija kategorija proizvoda (npr. "mlijeko" ≠ "čokolada")
6. Uzmi u obzir uobičajene skraćenice i varijante (npr. "jaja" = "jaje", "jabuke" = "jabuka")

ODGOVORI ISKLJUČIVO U JSON FORMATU:
{
    "is_match": true/false,
    "confidence": 0.0-1.0,
    "reasoning": "Kratko objašnjenje na bosanskom/hrvatskom"
}

PRIMJERI:
- Artikal: "mlijeko", OCR: "Dukat svježe mlijeko 1L" → is_match: true, confidence: 0.95
- Artikal: "kruh", OCR: "Čokoladna torta" → is_match: false, confidence: 0.98
- Artikal: "sir", OCR: "Mladi sir 250g" → is_match: true, confidence: 0.92
- Artikal: "jabuke", OCR: "Zlatni delišes jabuka 1kg" → is_match: true, confidence: 0.90"""


class AIVerificationService:
    """
    Service for AI-powered semantic verification of shopping items.
    
    Uses OpenAI GPT to determine if OCR text semantically matches
    the shopping list item name in Bosnian/Croatian language.
    """
    
    def __init__(self):
        self.settings = get_settings()
        self._client: Optional[OpenAI] = None
    
    @property
    def client(self) -> OpenAI:
        """
        Lazy initialization of OpenAI client.
        Raises error if API key not configured.
        """
        if self._client is None:
            if not self.settings.openai_api_key:
                raise ValueError(
                    "OpenAI API key not configured. "
                    "Set OPENAI_API_KEY environment variable."
                )
            self._client = OpenAI(api_key=self.settings.openai_api_key)
        return self._client
    
    def verify_match(self, item_name: str, ocr_text: str) -> AIVerificationResult:
        """
        Verify if OCR text semantically matches the shopping item.
        
        Args:
            item_name: Shopping list item name (e.g., "mlijeko")
            ocr_text: Text extracted from price tag via OCR
            
        Returns:
            AIVerificationResult with match decision and confidence
            
        Raises:
            ValueError: If AI service fails or returns invalid response
        """
        try:
            # Construct the user message
            user_message = f"""Artikal sa liste: "{item_name}"

Tekst sa cjenovnika (OCR): "{ocr_text}"

Da li se tekst sa cjenovnika SEMANTIČKI PODUDARA sa artiklom sa liste?"""
            
            logger.info(f"Verifying match: item='{item_name}', ocr_text='{ocr_text[:100]}...'")
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.settings.openai_model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.1,  # Low temperature for consistent results
                max_tokens=200,
                response_format={"type": "json_object"}  # Enforce JSON response
            )
            
            # Parse the response
            result_text = response.choices[0].message.content
            result_json = json.loads(result_text)
            
            # Validate and extract fields
            is_match = bool(result_json.get("is_match", False))
            confidence = float(result_json.get("confidence", 0.0))
            reasoning = str(result_json.get("reasoning", "Nije moguće utvrditi."))
            
            # Clamp confidence to valid range
            confidence = max(0.0, min(1.0, confidence))
            
            logger.info(
                f"AI verification complete: match={is_match}, "
                f"confidence={confidence:.2f}, reasoning='{reasoning}'"
            )
            
            return AIVerificationResult(
                is_match=is_match,
                confidence=confidence,
                reasoning=reasoning
            )
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {e}")
            raise ValueError("AI returned invalid response format")
        except Exception as e:
            logger.error(f"AI verification failed: {e}")
            raise ValueError(f"AI verification failed: {str(e)}")
    
    def verify_match_fallback(self, item_name: str, ocr_text: str) -> AIVerificationResult:
        """
        Fallback verification using simple keyword matching.
        
        Used when AI service is unavailable or fails.
        Less accurate but provides basic functionality.
        
        Args:
            item_name: Shopping list item name
            ocr_text: Text extracted from price tag
            
        Returns:
            AIVerificationResult based on keyword matching
        """
        logger.warning("Using fallback verification (AI service unavailable)")
        
        # Normalize text for comparison
        item_lower = item_name.lower().strip()
        ocr_lower = ocr_text.lower()
        
        # Simple substring matching
        is_match = item_lower in ocr_lower
        
        # Higher confidence for exact substring match
        if is_match:
            # Check if it's a word boundary match
            import re
            pattern = r'\b' + re.escape(item_lower) + r'\b'
            if re.search(pattern, ocr_lower):
                confidence = 0.85
                reasoning = f"Pronađeno tačno podudaranje: '{item_name}' u tekstu."
            else:
                confidence = 0.7
                reasoning = f"Pronađeno djelomično podudaranje: '{item_name}' u tekstu."
        else:
            confidence = 0.6
            reasoning = f"Artikal '{item_name}' nije pronađen u tekstu sa cjenovnika."
            is_match = False
        
        return AIVerificationResult(
            is_match=is_match,
            confidence=confidence,
            reasoning=reasoning
        )
