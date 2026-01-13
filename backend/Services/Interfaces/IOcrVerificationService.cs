using backend.DTOs.ShoppingLists;
using backend.Models;

namespace backend.Services.Interfaces;

/// <summary>
/// Interface for OCR + AI verification service.
/// Abstracts the communication with the Python OCR microservice.
/// </summary>
public interface IOcrVerificationService
{
    /// <summary>
    /// Verify if a price tag image matches a shopping item.
    /// 
    /// This method:
    /// 1. Sends the image to the OCR service
    /// 2. OCR extracts text from the price tag
    /// 3. AI verifies semantic match with item name
    /// 4. Returns verification result
    /// 
    /// IMPORTANT: Image is processed in-memory only and never stored.
    /// </summary>
    /// <param name="itemName">Shopping list item name (e.g., "mlijeko")</param>
    /// <param name="imageBase64">Base64-encoded image of the price tag</param>
    /// <returns>ServiceResult containing verification response</returns>
    Task<ServiceResult<VerifyItemResponse>> VerifyItemAsync(string itemName, string imageBase64);
}
