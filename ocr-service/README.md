# OCR + AI Verification Microservice

Mikroservis za verifikaciju kupovine putem OCR i AI semantičkog podudaranja.

## Opis

Ovaj servis omogućava:
- **OCR ekstrakciju** teksta sa slika cjenovnika/etiketa proizvoda
- **AI semantičko podudaranje** između artikala sa liste i teksta sa cjenovnika
- **Podrška za bosanski/hrvatski jezik**

## Arhitektura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React Native   │────▶│   .NET Backend   │────▶│  Python OCR     │
│  (Frontend)     │     │  (ShoppingLists) │     │  Microservice   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                                 ┌───────────────┐
                                                 │   Tesseract   │
                                                 │   + OpenAI    │
                                                 └───────────────┘
```

## Instalacija

### Lokalno pokretanje

1. **Instalirajte Tesseract OCR**:
   ```bash
   # Windows (s choco)
   choco install tesseract
   
   # Ubuntu/Debian
   sudo apt-get install tesseract-ocr tesseract-ocr-hrv
   
   # macOS
   brew install tesseract tesseract-lang
   ```

2. **Kreirajte virtualno okruženje**:
   ```bash
   cd ocr-service
   python -m venv venv
   
   # Windows
   .\venv\Scripts\activate
   
   # Linux/macOS
   source venv/bin/activate
   ```

3. **Instalirajte zavisnosti**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Konfiguracija**:
   ```bash
   # Kopirajte primjer konfiguracije
   cp env.example.txt .env
   
   # Uredite .env datoteku s vašim API ključem
   # OPENAI_API_KEY=sk-your-api-key-here
   ```

5. **Pokrenite servis**:
   ```bash
   python main.py
   ```

### Docker

```bash
docker build -t ocr-service .
docker run -p 8001:8001 -e OPENAI_API_KEY=sk-your-key ocr-service
```

## API Endpoints

### `POST /verify`

Verifikacija artikla putem slike cjenovnika.

**Request Body:**
```json
{
  "item_name": "mlijeko",
  "image_base64": "base64-encoded-image-data..."
}
```

**Response:**
```json
{
  "is_match": true,
  "confidence": 0.95,
  "ocr_text": "Dukat svježe mlijeko 2.8% 1L",
  "extracted_price": "2,49 KM",
  "message": "✓ Proizvod potvrđen: 'mlijeko' odgovara cjenovniku."
}
```

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "ocr_language": "hrv",
  "ai_model": "gpt-4o-mini",
  "services": {
    "ocr": true,
    "ai": true
  }
}
```

## Konfiguracija

| Varijabla | Opis | Default |
|-----------|------|---------|
| `OPENAI_API_KEY` | OpenAI API ključ | (obavezan) |
| `OPENAI_MODEL` | Model za AI verifikaciju | `gpt-4o-mini` |
| `OCR_LANGUAGE` | Tesseract jezik | `hrv` |
| `CONFIDENCE_THRESHOLD` | Min. pouzdanost za match | `0.7` |
| `DEBUG` | Debug mode | `false` |

## Sigurnosne napomene

⚠️ **VAŽNO: Slike se NE pohranjuju**

- Slike se obrađuju isključivo u memoriji
- Nakon ekstrakcije teksta, slika se odmah briše
- Nema pohrane u bazu podataka ili datotečni sustav

## Primjeri semantičkog podudaranja

| Artikal | OCR tekst | Rezultat |
|---------|-----------|----------|
| `mlijeko` | "Dukat svježe mlijeko 2.8% 1L" | ✅ Match |
| `kruh` | "Bijeli kruh 500g" | ✅ Match |
| `jogurt` | "Meggle voćni jogurt" | ✅ Match |
| `mlijeko` | "Čokoladna torta" | ❌ No match |
| `jabuke` | "Zlatni delišes jabuka 1kg" | ✅ Match |

## Deployment (Railway)

1. Dodajte ovaj folder kao zasebni servis na Railway
2. Postavite environment varijable:
   - `OPENAI_API_KEY`
   - `OCR_LANGUAGE=hrv`
3. Railway će automatski detektirati Dockerfile

## Troubleshooting

### OCR ne prepoznaje tekst
- Provjerite da je slika dovoljno jasna i dobro osvijetljena
- Minimalna preporučena rezolucija: 800x600 piksela

### AI vraća neočekivane rezultate
- Provjerite da je `OPENAI_API_KEY` ispravno postavljen
- Povećajte `CONFIDENCE_THRESHOLD` ako ima previše lažnih pozitiva
