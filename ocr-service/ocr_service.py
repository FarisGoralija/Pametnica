"""
OCR Service Module.
Handles image processing and text extraction using Tesseract OCR.

The service is designed to:
- Process images in-memory only (no file system storage)
- Support Bosnian/Croatian text recognition
- Focus on detecting product names and words (NOT prices)
- Filter out numeric values and currency symbols
"""

import base64
import io
import re
import logging
from typing import Optional, Tuple, List

from PIL import Image, ImageEnhance, ImageOps
import pytesseract

from config import get_settings
from models import OCRResult

logger = logging.getLogger(__name__)


class OCRService:
    """
    Service for extracting product names from price tag images.
    
    Uses Tesseract OCR with Croatian/Bosnian language.
    Focuses on extracting words, NOT prices or numbers.
    """
    
    def __init__(self):
        self.settings = get_settings()
    
    def process_image(self, image_base64: str) -> OCRResult:
        """
        Process a base64-encoded image and extract product names/words.
        
        Filters out prices and numeric values - only returns text words.
        
        Args:
            image_base64: Base64-encoded image (PNG/JPEG)
            
        Returns:
            OCRResult with extracted text (words only, no prices)
        """
        try:
            # Decode base64 to bytes (in-memory)
            image_bytes = base64.b64decode(image_base64)
            
            # Open image from bytes (no file system access)
            original_image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if original_image.mode not in ('RGB', 'L'):
                original_image = original_image.convert('RGB')
            
            # Get language setting (default: Croatian/Bosnian)
            lang = self.settings.ocr_language or 'hrv'
            
            # Try multiple OCR strategies and pick the best result
            results = []
            
            # Strategy 1: Original image, automatic page segmentation
            results.append(self._try_ocr(original_image, lang, '--oem 3 --psm 3'))
            
            # Strategy 2: Original image, single block of text
            results.append(self._try_ocr(original_image, lang, '--oem 3 --psm 6'))
            
            # Strategy 3: Grayscale image
            gray_image = self._to_grayscale(original_image)
            results.append(self._try_ocr(gray_image, lang, '--oem 3 --psm 3'))
            results.append(self._try_ocr(gray_image, lang, '--oem 3 --psm 6'))
            
            # Strategy 4: High contrast grayscale
            contrast_image = self._enhance_contrast(gray_image)
            results.append(self._try_ocr(contrast_image, lang, '--oem 3 --psm 3'))
            results.append(self._try_ocr(contrast_image, lang, '--oem 3 --psm 6'))
            
            # Strategy 5: Binarized (black and white)
            binary_image = self._binarize(gray_image)
            results.append(self._try_ocr(binary_image, lang, '--oem 3 --psm 6'))
            
            # Pick the best result (most meaningful words)
            best_text, best_confidence = self._select_best_result(results)
            
            # Clean up
            del original_image, gray_image, contrast_image, binary_image, image_bytes
            
            logger.info(f"OCR completed. Text: '{best_text}', Confidence: {best_confidence:.2f}")
            
            return OCRResult(
                text=best_text,
                confidence=best_confidence,
                extracted_price=None  # We don't extract prices anymore
            )
            
        except Exception as e:
            logger.error(f"OCR processing failed: {str(e)}")
            raise ValueError(f"Failed to process image: {str(e)}")
    
    def _try_ocr(self, image: Image.Image, lang: str, config: str) -> Tuple[str, float]:
        """
        Try OCR with specific language and configuration.
        Returns only words (filters out prices and numbers).
        """
        try:
            # Extract raw text
            raw_text = pytesseract.image_to_string(image, lang=lang, config=config)
            
            # Filter to keep only words (remove prices, numbers, symbols)
            words_only = self._extract_words_only(raw_text)
            
            # Calculate confidence based on word quality
            confidence = self._estimate_confidence(words_only)
            
            return (words_only, confidence)
        except Exception as e:
            logger.debug(f"OCR attempt failed: {e}")
            return ("", 0.0)
    
    def _extract_words_only(self, text: str) -> str:
        """
        Extract only alphabetic words from OCR text.
        Filters out:
        - Prices (12,99 KM, €3.50, etc.)
        - Numbers
        - Currency symbols
        - Single characters (noise)
        - Special characters
        
        Keeps:
        - Product names (mlijeko, hljeb, jogurt, etc.)
        - Alphabetic words (2+ characters)
        """
        if not text:
            return ""
        
        # Split into tokens
        tokens = text.split()
        
        # Filter to keep only valid words
        valid_words = []
        
        for token in tokens:
            # Clean the token
            cleaned = self._clean_token(token)
            
            # Skip if empty after cleaning
            if not cleaned:
                continue
            
            # Skip if it's a price pattern
            if self._is_price(cleaned):
                continue
            
            # Skip if it's mostly numbers
            if self._is_numeric(cleaned):
                continue
            
            # Skip single characters (likely noise)
            if len(cleaned) < 2:
                continue
            
            # Skip currency symbols and abbreviations
            if cleaned.upper() in ('KM', 'BAM', 'EUR', 'HRK', 'RSD', 'DIN'):
                continue
            
            # Keep valid words
            valid_words.append(cleaned)
        
        return ' '.join(valid_words)
    
    def _clean_token(self, token: str) -> str:
        """
        Clean a token by removing non-alphabetic characters from edges.
        Keeps Croatian/Bosnian special characters: č, ć, đ, š, ž
        """
        # Remove leading/trailing punctuation and special chars
        # Keep letters (including Croatian: čćđšž)
        cleaned = token.strip('.,;:!?()[]{}"\'-_=+*/\\|<>@#$%^&~`')
        
        # Remove any remaining non-letter characters from edges
        while cleaned and not cleaned[0].isalpha():
            cleaned = cleaned[1:]
        while cleaned and not cleaned[-1].isalpha():
            cleaned = cleaned[:-1]
        
        return cleaned
    
    def _is_price(self, text: str) -> bool:
        """Check if text looks like a price."""
        # Price patterns
        price_patterns = [
            r'^\d+[,\.]\d{2}$',          # 12,99 or 12.99
            r'^\d+[,\.]\d{2}\s*KM',      # 12,99 KM
            r'^\d+[,\.]\d{2}\s*€',       # 12,99 €
            r'^€?\d+[,\.]\d{2}',         # €12,99
            r'^\d+\s*(KM|EUR|BAM|kn)$',  # 12 KM
        ]
        
        for pattern in price_patterns:
            if re.match(pattern, text, re.IGNORECASE):
                return True
        
        return False
    
    def _is_numeric(self, text: str) -> bool:
        """Check if text is mostly numbers."""
        if not text:
            return False
        
        # Count digits vs letters
        digits = sum(1 for c in text if c.isdigit())
        letters = sum(1 for c in text if c.isalpha())
        
        # If more than 50% digits, consider it numeric
        total = digits + letters
        if total == 0:
            return True
        
        return digits / total > 0.5
    
    def _estimate_confidence(self, text: str) -> float:
        """
        Estimate confidence based on text quality.
        Higher confidence for more valid words.
        """
        if not text:
            return 0.0
        
        words = text.split()
        
        if not words:
            return 0.0
        
        # Count valid words (3+ characters, all letters)
        valid_word_count = sum(1 for w in words if len(w) >= 3 and w.isalpha())
        
        # Base confidence on valid word count
        if valid_word_count == 0:
            return 0.1
        elif valid_word_count == 1:
            return 0.5
        elif valid_word_count == 2:
            return 0.7
        else:
            return 0.85
    
    def _select_best_result(self, results: List[Tuple[str, float]]) -> Tuple[str, float]:
        """
        Select the best OCR result from multiple attempts.
        Prioritizes results with more valid words.
        """
        if not results:
            return ("", 0.0)
        
        # Filter out empty results
        valid_results = [(text, conf) for text, conf in results if text.strip()]
        
        if not valid_results:
            return ("", 0.0)
        
        # Score each result based on word quality
        scored_results = []
        for text, conf in valid_results:
            words = text.split()
            
            # Count words by length
            long_words = sum(1 for w in words if len(w) >= 4)  # mlijeko, jogurt
            medium_words = sum(1 for w in words if 2 <= len(w) < 4)  # sir, sok
            
            # Score: prioritize longer, meaningful words
            score = (long_words * 10) + (medium_words * 3) + conf
            
            scored_results.append((text, conf, score))
        
        # Sort by score (highest first)
        scored_results.sort(key=lambda x: x[2], reverse=True)
        
        best = scored_results[0]
        return (best[0], best[1])
    
    def _to_grayscale(self, image: Image.Image) -> Image.Image:
        """Convert image to grayscale."""
        return image.convert('L')
    
    def _enhance_contrast(self, image: Image.Image) -> Image.Image:
        """Enhance image contrast."""
        enhancer = ImageEnhance.Contrast(image)
        return enhancer.enhance(2.0)
    
    def _binarize(self, image: Image.Image) -> Image.Image:
        """Convert image to black and white."""
        if image.mode != 'L':
            image = image.convert('L')
        
        image = ImageOps.autocontrast(image)
        threshold = 128
        return image.point(lambda x: 255 if x > threshold else 0, mode='1')
