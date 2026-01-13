"""
OCR Service Module.
Handles image processing and text extraction using Tesseract OCR.

The service is designed to:
- Process images in-memory only (no file system storage)
- Support Bosnian/Croatian text recognition
- Focus on detecting product names and words (NOT prices)
- Filter out noise and garbage text
"""

import base64
import io
import re
import logging
from typing import Optional, Tuple, List

from PIL import Image, ImageEnhance, ImageOps, ImageFilter
import pytesseract

from config import get_settings
from models import OCRResult

logger = logging.getLogger(__name__)


class OCRService:
    """
    Service for extracting product names from price tag images.
    
    Uses Tesseract OCR with Croatian/Bosnian language.
    Focuses on extracting clean, readable words.
    """
    
    def __init__(self):
        self.settings = get_settings()
    
    def process_image(self, image_base64: str) -> OCRResult:
        """
        Process a base64-encoded image and extract product names/words.
        """
        try:
            # Decode base64 to bytes (in-memory)
            image_bytes = base64.b64decode(image_base64)
            
            # Open image from bytes
            original_image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if original_image.mode not in ('RGB', 'L'):
                original_image = original_image.convert('RGB')
            
            # Get language setting
            lang = self.settings.ocr_language or 'hrv'
            
            # Try multiple OCR strategies
            results = []
            
            # Prepare different image versions
            gray = original_image.convert('L')
            
            # High contrast version
            contrast = ImageEnhance.Contrast(gray).enhance(2.5)
            
            # Binarized (black and white) - good for clear text
            binary = self._binarize_otsu(gray)
            
            # Inverted binary (in case text is light on dark)
            inverted = ImageOps.invert(binary.convert('L')).point(lambda x: 255 if x > 128 else 0, mode='1')
            
            # Different PSM modes:
            # PSM 3 = Fully automatic page segmentation
            # PSM 6 = Single uniform block of text
            # PSM 7 = Single text line
            # PSM 8 = Single word
            # PSM 11 = Sparse text
            # PSM 13 = Raw line (no OSD)
            
            configs = [
                '--oem 3 --psm 6',   # Single block
                '--oem 3 --psm 7',   # Single line
                '--oem 3 --psm 8',   # Single word
                '--oem 3 --psm 11',  # Sparse text
                '--oem 3 --psm 3',   # Auto
            ]
            
            images_to_try = [binary, contrast, inverted, gray]
            
            for img in images_to_try:
                for config in configs:
                    result = self._try_ocr(img, lang, config)
                    if result[0]:  # If we got any text
                        results.append(result)
            
            # Pick the best result
            best_text, best_confidence = self._select_best_result(results)
            
            # Clean up
            del original_image, gray, contrast, binary, inverted, image_bytes
            
            logger.info(f"OCR completed. Text: '{best_text}', Confidence: {best_confidence:.2f}")
            
            return OCRResult(
                text=best_text,
                confidence=best_confidence,
                extracted_price=None
            )
            
        except Exception as e:
            logger.error(f"OCR processing failed: {str(e)}")
            raise ValueError(f"Failed to process image: {str(e)}")
    
    def _binarize_otsu(self, image: Image.Image) -> Image.Image:
        """
        Binarize image using Otsu's method approximation.
        """
        if image.mode != 'L':
            image = image.convert('L')
        
        # Get histogram
        histogram = image.histogram()
        
        # Calculate Otsu threshold
        total_pixels = image.width * image.height
        sum_total = sum(i * histogram[i] for i in range(256))
        
        sum_background = 0
        weight_background = 0
        max_variance = 0
        threshold = 0
        
        for i in range(256):
            weight_background += histogram[i]
            if weight_background == 0:
                continue
            
            weight_foreground = total_pixels - weight_background
            if weight_foreground == 0:
                break
            
            sum_background += i * histogram[i]
            
            mean_background = sum_background / weight_background
            mean_foreground = (sum_total - sum_background) / weight_foreground
            
            variance = weight_background * weight_foreground * (mean_background - mean_foreground) ** 2
            
            if variance > max_variance:
                max_variance = variance
                threshold = i
        
        return image.point(lambda x: 255 if x > threshold else 0, mode='1')
    
    def _try_ocr(self, image: Image.Image, lang: str, config: str) -> Tuple[str, float]:
        """
        Try OCR with specific language and configuration.
        """
        try:
            raw_text = pytesseract.image_to_string(image, lang=lang, config=config)
            
            # Clean and filter the text
            clean_text = self._clean_and_filter(raw_text)
            
            # Calculate confidence
            confidence = self._calculate_confidence(clean_text)
            
            return (clean_text, confidence)
        except Exception as e:
            logger.debug(f"OCR attempt failed: {e}")
            return ("", 0.0)
    
    def _clean_and_filter(self, text: str) -> str:
        """
        Clean OCR output and filter out garbage.
        Only keeps valid, readable words.
        """
        if not text:
            return ""
        
        # Split into words
        words = text.split()
        
        valid_words = []
        
        for word in words:
            # Clean the word
            cleaned = self._clean_word(word)
            
            if not cleaned:
                continue
            
            # Skip if too short
            if len(cleaned) < 2:
                continue
            
            # Skip if it's garbage (too many consonants, repeating chars, etc.)
            if self._is_garbage(cleaned):
                continue
            
            # Skip prices and numbers
            if self._is_price_or_number(cleaned):
                continue
            
            # Skip currency
            if cleaned.upper() in ('KM', 'BAM', 'EUR', 'HRK', 'RSD', 'DIN', 'USD'):
                continue
            
            valid_words.append(cleaned)
        
        return ' '.join(valid_words)
    
    def _clean_word(self, word: str) -> str:
        """
        Clean a single word - remove punctuation, keep letters only.
        """
        # Keep only letters (including Croatian: čćđšž)
        cleaned = ''.join(c for c in word if c.isalpha())
        return cleaned.strip()
    
    def _is_garbage(self, word: str) -> bool:
        """
        Detect if a word is garbage/noise.
        
        Garbage indicators:
        - Too many consonants in a row (more than 4)
        - Same character repeated 3+ times
        - No vowels in a word longer than 3 chars
        - Mix of upper and lower with no pattern
        """
        if not word:
            return True
        
        word_lower = word.lower()
        
        # Check for repeating characters (3+)
        for i in range(len(word_lower) - 2):
            if word_lower[i] == word_lower[i+1] == word_lower[i+2]:
                return True
        
        # Check for too many consonants in a row
        vowels = set('aeiouAEIOUčćđšžČĆĐŠŽ')
        consonant_count = 0
        max_consonants = 0
        
        for char in word_lower:
            if char.isalpha():
                if char not in vowels:
                    consonant_count += 1
                    max_consonants = max(max_consonants, consonant_count)
                else:
                    consonant_count = 0
        
        # More than 5 consonants in a row is likely garbage
        if max_consonants > 5:
            return True
        
        # No vowels in word longer than 4 chars
        if len(word) > 4:
            has_vowel = any(c in vowels for c in word_lower)
            if not has_vowel:
                return True
        
        # Check if word is mostly the same 2-3 characters repeating
        if len(word) >= 4:
            unique_chars = set(word_lower)
            if len(unique_chars) <= 2:
                return True
        
        return False
    
    def _is_price_or_number(self, text: str) -> bool:
        """Check if text is a price or number."""
        # Remove common formatting
        cleaned = text.replace(',', '.').replace(' ', '')
        
        # Check if it's mostly digits
        digit_count = sum(1 for c in cleaned if c.isdigit())
        if len(cleaned) > 0 and digit_count / len(cleaned) > 0.5:
            return True
        
        # Check for price patterns
        if re.match(r'^\d+[,\.]\d{2}$', cleaned):
            return True
        
        return False
    
    def _calculate_confidence(self, text: str) -> float:
        """
        Calculate confidence based on text quality.
        """
        if not text:
            return 0.0
        
        words = text.split()
        
        if not words:
            return 0.0
        
        # Score based on word quality
        total_score = 0
        
        for word in words:
            word_len = len(word)
            
            # Longer words are more likely to be real
            if word_len >= 5:
                total_score += 3
            elif word_len >= 3:
                total_score += 2
            else:
                total_score += 1
        
        # Normalize to 0-1 range
        confidence = min(total_score / 10, 1.0)
        
        return confidence
    
    def _select_best_result(self, results: List[Tuple[str, float]]) -> Tuple[str, float]:
        """
        Select the best OCR result.
        """
        if not results:
            return ("", 0.0)
        
        # Filter out empty results
        valid_results = [(text, conf) for text, conf in results if text.strip()]
        
        if not valid_results:
            return ("", 0.0)
        
        # Score each result
        scored = []
        for text, conf in valid_results:
            words = text.split()
            
            # Prefer results with fewer, longer words (more likely to be real product names)
            avg_word_len = sum(len(w) for w in words) / len(words) if words else 0
            word_count = len(words)
            
            # Score: prefer longer average word length, reasonable word count
            if word_count <= 5:  # Reasonable number of words
                score = avg_word_len * 2 + conf * 5
            else:
                score = avg_word_len + conf * 3  # Penalize too many words (likely noise)
            
            scored.append((text, conf, score))
        
        # Sort by score
        scored.sort(key=lambda x: x[2], reverse=True)
        
        return (scored[0][0], scored[0][1])
