namespace backend.Options;

/// <summary>
/// Configuration settings for the OCR verification microservice.
/// Loaded from appsettings.json "OcrService" section.
/// </summary>
public class OcrServiceSettings
{
    /// <summary>
    /// Base URL of the OCR verification microservice.
    /// Example: "http://localhost:8001" or "https://ocr-service.railway.app"
    /// </summary>
    public string BaseUrl { get; set; } = "http://localhost:8001";

    /// <summary>
    /// Timeout in seconds for OCR service requests.
    /// OCR + AI processing may take a few seconds.
    /// </summary>
    public int TimeoutSeconds { get; set; } = 30;

    /// <summary>
    /// Whether the OCR service is enabled.
    /// If false, verification requests will return an error.
    /// </summary>
    public bool Enabled { get; set; } = true;
}
