# OCR Service - Quick Start Guide

## 🎯 What Was Fixed

Your OCR was giving garbage/random characters because it was **filtering too aggressively**. 

**Solution**: Extract MORE text, let AI decide what's relevant.

---

## 🚀 Quick Testing

### Option 1: Run Test Script (Local)

```bash
cd ocr-service

# Install dependencies if not already
pip install -r requirements.txt

# Set OpenAI key
export OPENAI_API_KEY="your-key-here"  # Linux/Mac
set OPENAI_API_KEY=your-key-here       # Windows CMD
$env:OPENAI_API_KEY="your-key-here"    # Windows PowerShell

# Run tests
python test_ocr.py
```

### Option 2: Test with Docker

```bash
cd ocr-service

# Build image
docker build -t ocr-service:fixed .

# Run service
docker run -p 8001:8001 \
  -e OPENAI_API_KEY="your-key-here" \
  ocr-service:fixed

# In another terminal, test it
curl -X POST http://localhost:8001/health
```

### Option 3: Test via Frontend App

1. Start the OCR service (Docker or locally)
2. Start your backend (.NET)
3. Start your frontend (React Native)
4. Create a shopping list with item "hljeb"
5. Take a photo of a bread price tag
6. Check if it matches!

---

## 📋 Key Changes Summary

| Component | Change | Impact |
|-----------|--------|--------|
| **Text Filtering** | Reduced from 7+ checks to 2 checks | Extracts MORE text |
| **Image Processing** | Added sharpness, adjusted contrast | Better for mobile photos |
| **PSM Modes** | Optimized for price tags | Better layout detection |
| **AI Prompt** | Added OCR error tolerance | Handles typos/errors |
| **Confidence** | Lowered 0.7 → 0.6 | More accepting |
| **Fallback** | Added fuzzy matching | Works without AI |

---

## 🔍 What to Expect

### ✅ Before Fix:
```
Item: "hljeb"
Photo of: "BIJELI HLJEB 500g 2.50 KM"
OCR Output: "" (empty) or "^%#@" (garbage)
Result: ❌ No match
```

### ✅ After Fix:
```
Item: "hljeb"
Photo of: "BIJELI HLJEB 500g 2.50 KM"
OCR Output: "BIJELI HLJEB 500g 250 KM"
AI Analysis: "hljeb matches BIJELI HLJEB"
Result: ✅ Match confirmed (confidence: 0.92)
```

---

## 🛠️ Troubleshooting

### Problem: Still getting empty OCR output

**Possible causes**:
1. ❌ Tesseract not installed (Docker should have it)
2. ❌ Image quality too low
3. ❌ Wrong language pack

**Solutions**:
```bash
# Check Tesseract installation
tesseract --version

# Check Croatian language pack
tesseract --list-langs | grep hrv

# If missing, install:
apt-get install tesseract-ocr-hrv  # Ubuntu/Debian
```

### Problem: AI says "no match" for obvious matches

**Possible causes**:
1. ❌ Confidence threshold too high
2. ❌ OCR completely wrong
3. ❌ Wrong OpenAI API key

**Solutions**:
```bash
# Lower threshold
export CONFIDENCE_THRESHOLD=0.5

# Check API key
echo $OPENAI_API_KEY

# Check logs for AI reasoning
docker logs <container-id>
```

### Problem: Too many false positives

**Solution**: Increase confidence threshold
```bash
export CONFIDENCE_THRESHOLD=0.7  # or 0.75
```

---

## 📊 Monitoring

### Check Logs

```bash
# Docker
docker logs -f <container-id>

# Look for:
# ✅ "Raw OCR output: '...'"  - What Tesseract sees
# ✅ "Cleaned OCR text: '...'" - What goes to AI
# ✅ "AI verification complete: match=True, confidence=0.85"
```

### Check Metrics

Monitor these in production:
- **Empty OCR results** - Should be < 10%
- **Average confidence** - Should be 0.6-0.9
- **False positives** - Should be < 5%
- **False negatives** - Should be < 10%

---

## 🎛️ Fine-Tuning

### Adjust Confidence Threshold

In `.env` or environment:
```bash
# More strict (fewer false positives, more false negatives)
CONFIDENCE_THRESHOLD=0.75

# Balanced (default)
CONFIDENCE_THRESHOLD=0.6

# More lenient (more false positives, fewer false negatives)
CONFIDENCE_THRESHOLD=0.5
```

### Change AI Model

```bash
# Faster, cheaper (default)
OPENAI_MODEL=gpt-4o-mini

# More accurate, expensive
OPENAI_MODEL=gpt-4o

# Older, cheaper
OPENAI_MODEL=gpt-3.5-turbo
```

### Try Different Language

```bash
# Croatian (default)
OCR_LANGUAGE=hrv

# Bosnian (if available)
OCR_LANGUAGE=bos

# Serbian Latin
OCR_LANGUAGE=srp_latn

# Multiple languages
OCR_LANGUAGE=hrv+eng
```

---

## 📸 Photography Tips for Users

For best OCR results, tell users to:
1. ✅ Focus on the product name area
2. ✅ Use good lighting (no shadows)
3. ✅ Hold phone steady (no blur)
4. ✅ Capture text straight-on (not angled)
5. ✅ Fill frame with price tag

Avoid:
- ❌ Too far away (text too small)
- ❌ Dark photos
- ❌ Extreme angles (> 45°)
- ❌ Partial text (cut off)

---

## 🔄 Deployment Checklist

- [ ] Test locally with `test_ocr.py`
- [ ] Test with real price tag photos
- [ ] Verify confidence threshold (start at 0.6)
- [ ] Check OpenAI API key is set
- [ ] Monitor logs for first 24h
- [ ] Adjust threshold based on user feedback
- [ ] Document any additional fine-tuning

---

## 📚 Additional Resources

- **Full details**: See `IMPROVEMENTS.md`
- **Test script**: Run `python test_ocr.py`
- **Tesseract docs**: https://tesseract-ocr.github.io/
- **OpenAI docs**: https://platform.openai.com/docs

---

## 💡 Pro Tips

1. **Start conservative**: Use threshold 0.6, increase if too many false positives
2. **Monitor logs**: First week is crucial for tuning
3. **User feedback**: Add "Report wrong item" button in app
4. **Iterate**: OCR accuracy improves with fine-tuning
5. **Cache results**: Same image = same result (save API calls)

---

## 🆘 Need Help?

If issues persist:
1. Check logs for error messages
2. Test with `test_ocr.py` script
3. Verify Tesseract installation
4. Confirm OpenAI API key works
5. Share logs and sample images for debugging

**Remember**: The goal is to extract ALL readable text, then let AI filter. Don't worry if OCR output seems "messy" - that's expected!
