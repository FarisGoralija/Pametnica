using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.ShoppingLists;

/// <summary>
/// Request DTO for verifying a shopping item via OCR + AI.
/// Image is processed in-memory only - never stored.
/// </summary>
public class VerifyItemRequest
{
    /// <summary>
    /// Base64-encoded image of the price tag (PNG/JPEG).
    /// Image is processed in-memory and discarded immediately after verification.
    /// </summary>
    [Required]
    [MinLength(100, ErrorMessage = "Invalid image data")]
    public string ImageBase64 { get; set; } = string.Empty;
}
