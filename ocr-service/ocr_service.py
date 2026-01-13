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
            
            # Prepare different image versions optimized for price tag text
            gray = original_image.convert('L')
            
            # Enhance sharpness first (helps with blurry mobile photos)
            sharpened = ImageEnhance.Sharpness(gray).enhance(2.0)
            
            # Moderate contrast (not too aggressive)
            contrast = ImageEnhance.Contrast(sharpened).enhance(1.5)
            
            # Binarized (black and white) - good for clear text
            binary = self._binarize_otsu(contrast)
            
            # Inverted binary (in case text is light on dark)
            inverted = ImageOps.invert(binary.convert('L')).point(lambda x: 255 if x > 128 else 0, mode='1')
            
            # Different PSM modes optimized for price tags:
            # PSM 3 = Fully automatic page segmentation (best for complex layouts)
            # PSM 4 = Single column of text (good for vertical price tags)
            # PSM 6 = Single uniform block of text
            # PSM 11 = Sparse text (good for price tags with mixed elements)
            # PSM 12 = Sparse text with OSD
            
            configs = [
                '--oem 3 --psm 3',   # Auto (best starting point)
                '--oem 3 --psm 11',  # Sparse text (good for price tags)
                '--oem 3 --psm 12',  # Sparse text with orientation detection
                '--oem 3 --psm 4',   # Single column
                '--oem 3 --psm 6',   # Single block
            ]
            
            # Try these image versions in priority order
            images_to_try = [contrast, binary, sharpened, inverted, gray]
            
            for img in images_to_try:
                for config in configs:
                    result = self._try_ocr(img, lang, config)
                    if result[0]:  # If we got any text
                        results.append(result)
            
            # Pick the best result
            best_text, best_confidence = self._select_best_result(results)
            
            # Clean up
            del original_image, gray, sharpened, contrast, binary, inverted, image_bytes
            
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
            
            logger.debug(f"Raw OCR output: '{raw_text[:100]}...'")
            
            # Clean and filter the text (minimal filtering now)
            clean_text = self._clean_and_filter(raw_text)
            
            logger.debug(f"Cleaned OCR text: '{clean_text}'")
            
            # Calculate confidence
            confidence = self._calculate_confidence(clean_text)
            
            return (clean_text, confidence)
        except Exception as e:
            logger.debug(f"OCR attempt failed: {e}")
            return ("", 0.0)
    
    def _clean_and_filter(self, text: str) -> str:
        """
        Clean OCR output with minimal filtering.
        Extract all readable text and let AI determine relevance.
        """
        if not text:
            return ""
        
        # Remove excessive whitespace and normalize
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        text = ' '.join(lines)
        
        # Split into words
        words = text.split()
        
        valid_words = []
        
        for word in words:
            # Skip very short "words" (likely noise)
            if len(word) < 2:
                continue
            
            # Skip pure numbers and barcodes (all digits)
            if word.isdigit() and len(word) > 6:
                continue
            
            # Keep everything else - including mixed alphanumeric
            # AI will determine if it's the product name
            valid_words.append(word)
        
        return ' '.join(valid_words)
    
    def _clean_word(self, word: str) -> str:
        """
        Clean a single word - minimal cleaning, preserve most characters.
        """
        # Keep letters, numbers, and common characters
        # This preserves product codes, percentages, etc.
        cleaned = ''.join(c for c in word if c.isalnum() or c in '%.-')
        return cleaned.strip('.-')
    
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
        Calculate confidence based on text quantity and quality.
        """
        if not text:
            return 0.0
        
        words = text.split()
        
        if not words:
            return 0.0
        
        # Base confidence on having extracted text
        base_confidence = 0.5
        
        # Bonus for more words (up to a point)
        word_bonus = min(len(words) * 0.05, 0.3)
        
        # Bonus for longer words (suggests real text, not noise)
        avg_word_len = sum(len(w) for w in words) / len(words)
        length_bonus = min(avg_word_len * 0.03, 0.2)
        
        confidence = base_confidence + word_bonus + length_bonus
        
        # Clamp to 0-1 range
        return min(max(confidence, 0.1), 1.0)
    
    def _select_best_result(self, results: List[Tuple[str, float]]) -> Tuple[str, float]:
        """
        Select the best OCR result - prefer results with more readable text.
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
            word_count = len(words)
            total_chars = sum(len(w) for w in words)
            
            # Prefer results with more text (more information for AI to work with)
            # But also consider the confidence
            char_score = total_chars * 0.5  # More characters = better
            word_score = word_count * 2     # More words = better
            conf_score = conf * 10           # Confidence matters
            
            score = char_score + word_score + conf_score
            
            scored.append((text, conf, score))
        
        # Sort by score
        scored.sort(key=lambda x: x[2], reverse=True)
        
        return (scored[0][0], scored[0][1])
