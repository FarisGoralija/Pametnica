# OCR + AI Verification Service
# Docker image with Tesseract OCR and Python

FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies for Tesseract OCR
# Including Croatian/Bosnian language pack
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-hrv \
    libtesseract-dev \
    libleptonica-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8001

# Environment variables (override in deployment)
ENV PYTHONUNBUFFERED=1
ENV OPENAI_API_KEY=""
ENV OPENAI_MODEL="gpt-4o-mini"
ENV OCR_LANGUAGE="hrv"
ENV CONFIDENCE_THRESHOLD="0.7"
ENV DEBUG="false"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
