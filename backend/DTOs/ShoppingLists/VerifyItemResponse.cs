namespace backend.DTOs.ShoppingLists;

/// <summary>
/// Response DTO for item verification result.
/// Contains match status, confidence score, and extracted information.
/// </summary>
public class VerifyItemResponse
{
    /// <summary>
    /// Whether the OCR text semantically matches the shopping item name.
    /// </summary>
    public bool IsMatch { get; set; }

    /// <summary>
    /// Confidence score of the match (0.0 to 1.0).
    /// Higher values indicate more certain matches.
    /// </summary>
    public double Confidence { get; set; }

    /// <summary>
    /// Raw text extracted from the image via OCR.
    /// Useful for debugging or manual verification.
    /// </summary>
    public string OcrText { get; set; } = string.Empty;

    /// <summary>
    /// Price extracted from the OCR text, if detected.
    /// Can be used to pre-fill the price input field.
    /// </summary>
    public string? ExtractedPrice { get; set; }

    /// <summary>
    /// Human-readable message explaining the verification result.
    /// In Bosnian/Croatian language.
    /// </summary>
    public string Message { get; set; } = string.Empty;
}
