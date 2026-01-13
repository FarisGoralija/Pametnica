"""
Simple test script for OCR service improvements.
Tests the OCR extraction and AI verification with sample data.
"""

import base64
import json
import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from ocr_service import OCRService
from ai_service import AIVerificationService


def test_ocr_extraction():
    """Test OCR text extraction with a sample image."""
    print("=" * 60)
    print("TEST 1: OCR Text Extraction")
    print("=" * 60)
    
    # You can test with a real image by providing the path
    print("\nTo test with a real image:")
    print("1. Take a photo of a price tag")
    print("2. Convert to base64")
    print("3. Replace the test_image_base64 variable below")
    print()
    
    # Example: test with a simple white image (will extract nothing, but tests the pipeline)
    # Create a simple test image
    from PIL import Image
    import io
    
    # Create a test image with text
    img = Image.new('RGB', (300, 100), color='white')
    from PIL import ImageDraw, ImageFont
    draw = ImageDraw.ImageDraw(img)
    
    # Draw sample text (simulating a price tag)
    try:
        draw.text((10, 30), "BIJELI HLJEB 500g", fill='black')
        draw.text((10, 60), "2.50 KM", fill='black')
    except:
        # If font fails, just create blank image
        pass
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    test_image_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    print("Test image created (white background with 'BIJELI HLJEB 500g')")
    
    # Initialize OCR service
    print("\nInitializing OCR service...")
    ocr_service = OCRService()
    
    # Process image
    print("Processing image with OCR...")
    try:
        result = ocr_service.process_image(test_image_base64)
        
        print(f"\n✅ OCR Extraction Successful!")
        print(f"   Extracted text: '{result.text}'")
        print(f"   Confidence: {result.confidence:.2f}")
        
        if result.text:
            print(f"\n   Word count: {len(result.text.split())}")
            print(f"   Character count: {len(result.text)}")
        else:
            print("\n   ⚠️  No text extracted (this is normal for the test image)")
            print("       Try with a real photo of a price tag!")
        
        return result.text
    
    except Exception as e:
        print(f"\n❌ OCR Failed: {str(e)}")
        return ""


def test_ai_verification(ocr_text):
    """Test AI semantic verification."""
    print("\n" + "=" * 60)
    print("TEST 2: AI Semantic Verification")
    print("=" * 60)
    
    # Test cases
    test_cases = [
        ("hljeb", "BIJELI HLJEB 500g"),
        ("mlijeko", "Dukat svježe mlijeko 2.8% 1L"),
        ("jogurt", "Meggle jogurt voćni 150g"),
        ("čokolada", "BIJELI HLJEB 500g"),  # Should NOT match
    ]
    
    # Use provided OCR text if available
    if ocr_text:
        test_cases.insert(0, ("hljeb", ocr_text))
    
    print("\nTest cases:")
    for i, (item, ocr) in enumerate(test_cases, 1):
        print(f"  {i}. Item: '{item}' vs OCR: '{ocr}'")
    
    print("\n" + "-" * 60)
    
    # Check if AI service is configured
    try:
        import os
        if not os.getenv("OPENAI_API_KEY"):
            print("\n⚠️  OPENAI_API_KEY not set!")
            print("   Set it in .env file or environment variable")
            print("   Skipping AI verification tests")
            return
        
        print("\nInitializing AI service...")
        ai_service = AIVerificationService()
        
        print("\nRunning verification tests...\n")
        
        for i, (item_name, ocr_text) in enumerate(test_cases, 1):
            print(f"Test {i}: '{item_name}' vs '{ocr_text}'")
            
            try:
                result = ai_service.verify_match(item_name, ocr_text)
                
                match_symbol = "✅" if result.is_match else "❌"
                print(f"  {match_symbol} Match: {result.is_match}")
                print(f"     Confidence: {result.confidence:.2f}")
                print(f"     Reasoning: {result.reasoning}")
                print()
            
            except Exception as e:
                print(f"  ❌ Error: {str(e)}")
                print(f"     Trying fallback verification...\n")
                
                # Try fallback
                try:
                    result = ai_service.verify_match_fallback(item_name, ocr_text)
                    
                    match_symbol = "✅" if result.is_match else "❌"
                    print(f"  {match_symbol} Fallback Match: {result.is_match}")
                    print(f"     Confidence: {result.confidence:.2f}")
                    print(f"     Reasoning: {result.reasoning}")
                    print()
                
                except Exception as e2:
                    print(f"  ❌ Fallback also failed: {str(e2)}\n")
    
    except ImportError as e:
        print(f"\n❌ Import error: {str(e)}")
        print("   Make sure all dependencies are installed:")
        print("   pip install -r requirements.txt")


def main():
    """Run all tests."""
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║  OCR SERVICE TEST SUITE - Improvements Verification     ║")
    print("╚" + "=" * 58 + "╝")
    print()
    
    # Test 1: OCR Extraction
    ocr_text = test_ocr_extraction()
    
    # Test 2: AI Verification
    test_ai_verification(ocr_text)
    
    print("\n" + "=" * 60)
    print("TESTS COMPLETED")
    print("=" * 60)
    print("\n📸 To test with a real image:")
    print("   1. Take a photo of a price tag (hljeb, mlijeko, etc.)")
    print("   2. Use the frontend app or API endpoint")
    print("   3. Check the logs for OCR output")
    print()


if __name__ == "__main__":
    main()
