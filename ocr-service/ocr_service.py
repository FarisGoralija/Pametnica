"""
OCR Service Module.
Handles image processing and text extraction using Tesseract OCR.

The service is designed to:
- Process images in-memory only (no file system storage)
- Support Bosnian/Croatian text recognition
- Extract both product names and prices from price tags
"""

import base64
import io
import re
import logging
from typing import Optional, Tuple

from PIL import Image, ImageEnhance, ImageFilter
import pytesseract

from config import get_settings
from models import OCRResult

logger = logging.getLogger(__name__)


class OCRService:
    """
    Service for extracting text from price tag images.
    
    Uses Tesseract OCR with Croatian language pack (works for Bosnian too).
    Applies image preprocessing to improve OCR accuracy.
    """
    
    def __init__(self):
        self.settings = get_settings()
        # Tesseract configuration for better accuracy
        # PSM 6: Assume a single uniform block of text
        # OEM 3: Default, based on what is available
        self.tesseract_config = r'--oem 3 --psm 6'
    
    def process_image(self, image_base64: str) -> OCRResult:
        """
        Process a base64-encoded image and extract text.
        
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
            image = Image.open(io.BytesIO(image_bytes))
            
            # Preprocess image for better OCR accuracy
            processed_image = self._preprocess_image(image)
            
            # Perform OCR with Croatian language
            # Croatian (hrv) handles Bosnian text well due to shared characters
            ocr_data = pytesseract.image_to_data(
                processed_image,
                lang=self.settings.ocr_language,
                config=self.tesseract_config,
                output_type=pytesseract.Output.DICT
            )
            
            # Extract text and calculate average confidence
            text, avg_confidence = self._extract_text_with_confidence(ocr_data)
            
            # Try to extract price from the text
            extracted_price = self._extract_price(text)
            
            # Clean up: explicitly delete image objects
            # (Python GC handles this, but being explicit for clarity)
            del image
            del processed_image
            del image_bytes
            
            logger.info(f"OCR completed. Text length: {len(text)}, Confidence: {avg_confidence:.2f}")
            
            return OCRResult(
                text=text,
                confidence=avg_confidence,
                extracted_price=extracted_price
            )
            
        except Exception as e:
            logger.error(f"OCR processing failed: {str(e)}")
            raise ValueError(f"Failed to process image: {str(e)}")
    
    def _preprocess_image(self, image: Image.Image) -> Image.Image:
        """
        Apply preprocessing to improve OCR accuracy.
        
        Steps:
        1. Convert to grayscale
        2. Increase contrast
        3. Apply sharpening
        4. Resize if too small
        """
        # Convert to grayscale for better OCR
        if image.mode != 'L':
            image = image.convert('L')
        
        # Resize if image is too small (OCR works better with larger images)
        min_dimension = 800
        if min(image.size) < min_dimension:
            scale = min_dimension / min(image.size)
            new_size = (int(image.width * scale), int(image.height * scale))
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.5)
        
        # Apply slight sharpening
        image = image.filter(ImageFilter.SHARPEN)
        
        return image
    
    def _extract_text_with_confidence(self, ocr_data: dict) -> Tuple[str, float]:
        """
        Extract text from Tesseract output and calculate average confidence.
        
        Args:
            ocr_data: Dictionary output from pytesseract.image_to_data
            
        Returns:
            Tuple of (extracted_text, average_confidence)
        """
        words = []
        confidences = []
        
        for i, word in enumerate(ocr_data['text']):
            # Skip empty words
            if word.strip():
                conf = int(ocr_data['conf'][i])
                # Only include words with positive confidence
                if conf > 0:
                    words.append(word)
                    confidences.append(conf)
        
        text = ' '.join(words)
        avg_confidence = sum(confidences) / len(confidences) / 100 if confidences else 0.0
        
        return text, avg_confidence
    
    def _extract_price(self, text: str) -> Optional[str]:
        """
        Attempt to extract price from OCR text.
        
        Looks for common price patterns:
        - "12,99 KM" or "12.99 KM"
        - "12,99" or "12.99"
        - Currency symbols: €, $, KM, BAM
        
        Args:
            text: Raw OCR text
            
        Returns:
            Extracted price string or None if not found
        """
        # Common price patterns for Bosnian market
        # Supports KM (Convertible Mark), EUR, and common formats
        patterns = [
            # Price with currency: "12,99 KM" or "12.99 KM"
            r'(\d+[,\.]\d{2})\s*(KM|BAM|€|EUR)',
            # Currency before price
            r'(KM|BAM|€|EUR)\s*(\d+[,\.]\d{2})',
            # Just decimal number (likely price)
            r'(\d+[,\.]\d{2})',
            # Whole number with currency
            r'(\d+)\s*(KM|BAM|€|EUR)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                # Return the full match
                return match.group(0).strip()
        
        return None
