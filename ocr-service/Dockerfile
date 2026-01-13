# OCR + AI Verification Service
# Docker image with Tesseract OCR and Python

FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies for Tesseract OCR
# Croatian/Bosnian + script detection for Latin characters
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-hrv \
    tesseract-ocr-osd \
    libtesseract-dev \
    libleptonica-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Environment variables (override in deployment)
ENV PYTHONUNBUFFERED=1
ENV OPENAI_API_KEY=""
ENV OPENAI_MODEL="gpt-4o-mini"
ENV OCR_LANGUAGE="hrv"
ENV CONFIDENCE_THRESHOLD="0.7"
ENV DEBUG="false"
# Default port (Railway will override with PORT env var)
ENV PORT=8001

# Expose port (Railway uses dynamic PORT)
EXPOSE $PORT

# Run the application using shell form to expand $PORT variable
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
