"""
OCR Service Module.
Handles image processing and text extraction using Tesseract OCR.

The service is designed to:
- Process images in-memory only (no file system storage)
- Support multiple languages (English + Croatian/Bosnian)
- Try multiple OCR strategies to get the best result
- Extract both product names and prices from price tags
"""

import base64
import io
import re
import logging
from typing import Optional, Tuple, List

from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import pytesseract

from config import get_settings
from models import OCRResult

logger = logging.getLogger(__name__)


class OCRService:
    """
    Service for extracting text from price tag images.
    
    Uses Tesseract OCR with multiple strategies to maximize accuracy.
    Tries different preprocessing and configuration combinations.
    """
    
    def __init__(self):
        self.settings = get_settings()
    
    def process_image(self, image_base64: str) -> OCRResult:
        """
        Process a base64-encoded image and extract text.
        
        Tries multiple OCR strategies and returns the best result.
        
        Args:
            image_base64: Base64-encoded image (PNG/JPEG)
            
        Returns:
            OCRResult with extracted text and confidence
            
        Note:
            Image is processed entirely in-memory and discarded after processing.
        """
        try:
            # Decode base64 to bytes (in-memory)
            image_bytes = base64.b64decode(image_base64)
            
            # Open image from bytes (no file system access)
            original_image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary (some images might be RGBA or other modes)
            if original_image.mode not in ('RGB', 'L'):
                original_image = original_image.convert('RGB')
            
            # Try multiple OCR strategies and pick the best result
            results = []
            
            # Strategy 1: Original image with English
            results.append(self._try_ocr(original_image, 'eng', '--oem 3 --psm 3'))
            
            # Strategy 2: Original image with English, single block
            results.append(self._try_ocr(original_image, 'eng', '--oem 3 --psm 6'))
            
            # Strategy 3: Grayscale with English
            gray_image = self._to_grayscale(original_image)
            results.append(self._try_ocr(gray_image, 'eng', '--oem 3 --psm 3'))
            
            # Strategy 4: High contrast grayscale with English
            contrast_image = self._enhance_contrast(gray_image)
            results.append(self._try_ocr(contrast_image, 'eng', '--oem 3 --psm 6'))
            
            # Strategy 5: Binarized (black and white) with English
            binary_image = self._binarize(gray_image)
            results.append(self._try_ocr(binary_image, 'eng', '--oem 3 --psm 6'))
            
            # Strategy 6: Try with Croatian for local products
            lang = self.settings.ocr_language
            if lang and lang != 'eng':
                results.append(self._try_ocr(original_image, lang, '--oem 3 --psm 3'))
                results.append(self._try_ocr(gray_image, lang, '--oem 3 --psm 6'))
            
            # Strategy 7: Try combined English + Croatian
            try:
                combined_lang = f'eng+{lang}' if lang and lang != 'eng' else 'eng'
                results.append(self._try_ocr(contrast_image, combined_lang, '--oem 3 --psm 3'))
            except:
                pass  # Combined language might not be available
            
            # Pick the best result (longest meaningful text with reasonable confidence)
            best_result = self._select_best_result(results)
            
            # Try to extract price from the text
            extracted_price = self._extract_price(best_result[0])
            
            # Clean up
            del original_image
            del gray_image
            del contrast_image
            del binary_image
            del image_bytes
            
            logger.info(f"OCR completed. Text length: {len(best_result[0])}, Confidence: {best_result[1]:.2f}")
            logger.info(f"Extracted text: '{best_result[0][:200]}...' " if len(best_result[0]) > 200 else f"Extracted text: '{best_result[0]}'")
            
            return OCRResult(
                text=best_result[0],
                confidence=best_result[1],
                extracted_price=extracted_price
            )
            
        except Exception as e:
            logger.error(f"OCR processing failed: {str(e)}")
            raise ValueError(f"Failed to process image: {str(e)}")
    
    def _try_ocr(self, image: Image.Image, lang: str, config: str) -> Tuple[str, float]:
        """
        Try OCR with specific language and configuration.
        
        Returns:
            Tuple of (extracted_text, confidence)
        """
        try:
            # Use image_to_string for simpler, more reliable extraction
            text = pytesseract.image_to_string(image, lang=lang, config=config)
            
            # Clean up the text
            text = self._clean_text(text)
            
            # Calculate a simple confidence based on text quality
            confidence = self._estimate_confidence(text)
            
            return (text, confidence)
        except Exception as e:
            logger.debug(f"OCR attempt failed with lang={lang}, config={config}: {e}")
            return ("", 0.0)
    
    def _clean_text(self, text: str) -> str:
        """
        Clean up OCR output text.
        """
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = ' '.join(text.split())
        
        # Remove isolated single characters that are likely noise
        words = text.split()
        cleaned_words = [w for w in words if len(w) > 1 or w.isdigit() or w in '€$']
        
        return ' '.join(cleaned_words)
    
    def _estimate_confidence(self, text: str) -> float:
        """
        Estimate confidence based on text quality.
        
        Higher confidence for:
        - Longer text
        - More alphabetic characters
        - Fewer special characters
        """
        if not text:
            return 0.0
        
        # Count different character types
        alpha_count = sum(1 for c in text if c.isalpha())
        digit_count = sum(1 for c in text if c.isdigit())
        space_count = sum(1 for c in text if c.isspace())
        special_count = len(text) - alpha_count - digit_count - space_count
        
        total_meaningful = alpha_count + digit_count
        
        if total_meaningful == 0:
            return 0.0
        
        # Calculate ratio of meaningful characters
        meaningful_ratio = total_meaningful / len(text.replace(' ', ''))
        
        # Bonus for having actual words (3+ letter sequences)
        word_count = len([w for w in text.split() if len(w) >= 3 and w.isalpha()])
        word_bonus = min(word_count * 0.1, 0.3)
        
        confidence = min(meaningful_ratio + word_bonus, 1.0)
        
        return confidence
    
    def _select_best_result(self, results: List[Tuple[str, float]]) -> Tuple[str, float]:
        """
        Select the best OCR result from multiple attempts.
        
        Prioritizes:
        1. Results with actual readable words
        2. Longer text (more information)
        3. Higher estimated confidence
        """
        if not results:
            return ("", 0.0)
        
        # Filter out empty results
        valid_results = [(text, conf) for text, conf in results if text.strip()]
        
        if not valid_results:
            return ("", 0.0)
        
        # Score each result
        scored_results = []
        for text, conf in valid_results:
            # Count words with 3+ letters
            word_count = len([w for w in text.split() if len(w) >= 3])
            
            # Score based on word count, text length, and confidence
            score = (word_count * 10) + (len(text) * 0.1) + (conf * 20)
            
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
        """
        Convert image to black and white using adaptive thresholding.
        """
        # Ensure grayscale
        if image.mode != 'L':
            image = image.convert('L')
        
        # Use Otsu-like thresholding via autocontrast + point
        image = ImageOps.autocontrast(image)
        
        # Threshold to black and white
        threshold = 128
        return image.point(lambda x: 255 if x > threshold else 0, mode='1')
    
    def _extract_price(self, text: str) -> Optional[str]:
        """
        Attempt to extract price from OCR text.
        
        Looks for common price patterns:
        - "12,99 KM" or "12.99 KM"
        - "12,99" or "12.99"
        - Currency symbols: €, $, KM, BAM
        """
        if not text:
            return None
            
        # Common price patterns for Bosnian market
        patterns = [
            # Price with currency: "12,99 KM" or "12.99 KM"
            r'(\d+[,\.]\d{2})\s*(KM|BAM|€|EUR|kn|HRK)',
            # Currency before price
            r'(KM|BAM|€|EUR|kn|HRK)\s*(\d+[,\.]\d{2})',
            # Just decimal number (likely price)
            r'(\d{1,3}[,\.]\d{2})',
            # Whole number with currency
            r'(\d+)\s*(KM|BAM|€|EUR|kn|HRK)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0).strip()
        
        return None
