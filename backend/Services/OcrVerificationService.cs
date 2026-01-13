using System.Net.Http.Json;
using System.Text.Json;
using backend.DTOs.ShoppingLists;
using backend.Models;
using backend.Options;
using backend.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace backend.Services;

/// <summary>
/// Service for communicating with the Python OCR + AI verification microservice.
/// 
/// This service:
/// - Sends images to the OCR service for text extraction
/// - Receives AI-powered semantic verification results
/// - Handles errors and timeouts gracefully
/// 
/// CRITICAL: Images are processed in-memory only.
/// No image data is stored in the database or file system.
/// </summary>
public class OcrVerificationService : IOcrVerificationService
{
    private readonly HttpClient _httpClient;
    private readonly OcrServiceSettings _settings;
    private readonly ILogger<OcrVerificationService> _logger;

    // JSON options - use snake_case for sending to Python, case-insensitive for reading
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true
    };

    public OcrVerificationService(
        HttpClient httpClient,
        IOptions<OcrServiceSettings> settings,
        ILogger<OcrVerificationService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;

        // Configure HttpClient timeout
        _httpClient.Timeout = TimeSpan.FromSeconds(_settings.TimeoutSeconds);
    }

    public async Task<ServiceResult<VerifyItemResponse>> VerifyItemAsync(string itemName, string imageBase64)
    {
        if (!_settings.Enabled)
        {
            return ServiceResult<VerifyItemResponse>.Fail(
                "OCR verifikacija nije omogućena. Kontaktirajte administratora.",
                StatusCodes.Status503ServiceUnavailable);
        }

        try
        {
            _logger.LogInformation("Verifying item '{ItemName}' via OCR service", itemName);

            // Prepare request payload
            // Image is sent to OCR service and processed in-memory there
            var requestPayload = new OcrVerifyRequest
            {
                ItemName = itemName,
                ImageBase64 = imageBase64
            };

            // Send request to Python OCR service
            var response = await _httpClient.PostAsJsonAsync(
                $"{_settings.BaseUrl}/verify",
                requestPayload,
                JsonOptions);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError(
                    "OCR service returned error: {StatusCode} - {Error}",
                    response.StatusCode, errorContent);

                // Parse error message if possible
                string errorMessage = "Greška pri verifikaciji slike.";
                try
                {
                    var errorJson = JsonDocument.Parse(errorContent);
                    if (errorJson.RootElement.TryGetProperty("detail", out var detail))
                    {
                        errorMessage = detail.GetString() ?? errorMessage;
                    }
                }
                catch
                {
                    // Use default error message
                }

                return ServiceResult<VerifyItemResponse>.Fail(
                    errorMessage,
                    (int)response.StatusCode);
            }

            // Parse successful response
            var result = await response.Content.ReadFromJsonAsync<OcrServiceResponse>(JsonOptions);

            if (result == null)
            {
                return ServiceResult<VerifyItemResponse>.Fail(
                    "Neispravan odgovor od OCR servisa.",
                    StatusCodes.Status502BadGateway);
            }

            _logger.LogInformation(
                "OCR verification complete for '{ItemName}': match={IsMatch}, confidence={Confidence:F2}",
                itemName, result.IsMatch, result.Confidence);

            // Map to response DTO
            // Image data has already been discarded by the OCR service
            return ServiceResult<VerifyItemResponse>.Ok(new VerifyItemResponse
            {
                IsMatch = result.IsMatch,
                Confidence = result.Confidence,
                OcrText = result.OcrText,
                ExtractedPrice = result.ExtractedPrice,
                Message = result.Message
            });
        }
        catch (TaskCanceledException)
        {
            _logger.LogError("OCR service request timed out");
            return ServiceResult<VerifyItemResponse>.Fail(
                "Verifikacija je istekla. Molimo pokušajte ponovo.",
                StatusCodes.Status504GatewayTimeout);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to connect to OCR service");
            return ServiceResult<VerifyItemResponse>.Fail(
                "Ne mogu se povezati na servis za verifikaciju. Molimo pokušajte kasnije.",
                StatusCodes.Status503ServiceUnavailable);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during OCR verification");
            return ServiceResult<VerifyItemResponse>.Fail(
                "Neočekivana greška pri verifikaciji.",
                StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Internal DTO for request to Python OCR service.
    /// </summary>
    private class OcrVerifyRequest
    {
        public string ItemName { get; set; } = string.Empty;
        public string ImageBase64 { get; set; } = string.Empty;
    }

    /// <summary>
    /// Internal DTO matching the Python OCR service response.
    /// </summary>
    private class OcrServiceResponse
    {
        public bool IsMatch { get; set; }
        public double Confidence { get; set; }
        public string OcrText { get; set; } = string.Empty;
        public string? ExtractedPrice { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
