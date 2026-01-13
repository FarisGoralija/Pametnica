using System.Security.Claims;
using backend.Constants;
using backend.DTOs.ShoppingLists;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShoppingListsController(
    IShoppingListService shoppingListService,
    IOcrVerificationService ocrVerificationService) : ControllerBase
{
    // Child endpoints
    [HttpPost]
    [Authorize(Roles = RoleNames.Child)]
    public async Task<IActionResult> CreateList([FromBody] CreateShoppingListRequest request)
    {
        var childId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await shoppingListService.CreateAsync(childId, request);
        return result.Success
            ? CreatedAtAction(nameof(GetActive), new { id = result.Data!.Id }, result.Data)
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, new { error = result.Error });
    }

    [HttpPost("{listId:guid}/items")]
    [Authorize(Roles = $"{RoleNames.Child},{RoleNames.Parent}")]
    public async Task<IActionResult> AddItem(Guid listId, [FromBody] CreateShoppingListItemRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isParent = User.IsInRole(RoleNames.Parent);
        var result = await shoppingListService.AddItemAsync(userId, isParent, listId, request);
        return ToActionResult(result);
    }

    // Shared child/parent update path
    [HttpPut("{listId:guid}/items/{itemId:guid}")]
    [Authorize(Roles = $"{RoleNames.Child},{RoleNames.Parent}")]
    public async Task<IActionResult> UpdateItem(Guid listId, Guid itemId, [FromBody] UpdateShoppingListItemRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isParent = User.IsInRole(RoleNames.Parent);
        var result = await shoppingListService.UpdateItemAsync(userId, isParent, listId, itemId, request);
        return ToActionResult(result);
    }

    [HttpDelete("{listId:guid}/items/{itemId:guid}")]
    [Authorize(Roles = $"{RoleNames.Child},{RoleNames.Parent}")]
    public async Task<IActionResult> RemoveItem(Guid listId, Guid itemId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isParent = User.IsInRole(RoleNames.Parent);
        var result = await shoppingListService.RemoveItemAsync(userId, isParent, listId, itemId);
        return result.Success
            ? NoContent()
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, new { error = result.Error });
    }

    [HttpPost("{listId:guid}/submit")]
    [Authorize(Roles = RoleNames.Child)]
    public async Task<IActionResult> Submit(Guid listId)
    {
        var childId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await shoppingListService.SubmitAsync(childId, listId);
        return ToActionResult(result);
    }

    [HttpPut("{listId:guid}/title")]
    [Authorize(Roles = $"{RoleNames.Child},{RoleNames.Parent}")]
    public async Task<IActionResult> UpdateTitle(Guid listId, [FromBody] UpdateShoppingListTitleRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isParent = User.IsInRole(RoleNames.Parent);
        var result = await shoppingListService.UpdateTitleAsync(userId, isParent, listId, request.Title);
        return ToActionResult(result);
    }

    [HttpDelete("{listId:guid}")]
    [Authorize(Roles = $"{RoleNames.Child},{RoleNames.Parent}")]
    public async Task<IActionResult> Delete(Guid listId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isParent = User.IsInRole(RoleNames.Parent);
        var result = await shoppingListService.DeleteAsync(userId, isParent, listId);
        return result.Success
            ? NoContent()
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, new { error = result.Error });
    }

    [HttpPost("{listId:guid}/items/{itemId:guid}/complete")]
    [Authorize(Roles = RoleNames.Child)]
    public async Task<IActionResult> CompleteItem(Guid listId, Guid itemId, [FromBody] CompleteItemRequest request)
    {
        var childId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await shoppingListService.CompleteItemAsync(childId, listId, itemId, request.Price);
        return ToActionResult(result);
    }

    [HttpGet("pending")]
    [Authorize(Roles = RoleNames.Child)]
    public async Task<IActionResult> GetPending()
    {
        var childId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await shoppingListService.GetChildPendingAsync(childId);
        return Ok(result.Data);
    }

    [HttpGet("active")]
    [Authorize(Roles = RoleNames.Child)]
    public async Task<IActionResult> GetActive()
    {
        var childId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await shoppingListService.GetChildActiveAsync(childId);
        return Ok(result.Data);
    }

    [HttpGet("history")]
    [Authorize(Roles = RoleNames.Child)]
    public async Task<IActionResult> GetHistory()
    {
        var childId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await shoppingListService.GetChildHistoryAsync(childId);
        return Ok(result.Data);
    }

    // Parent endpoints
    [HttpPut("{listId:guid}/approve")]
    [Authorize(Roles = RoleNames.Parent)]
    public async Task<IActionResult> Approve(Guid listId)
    {
        var parentId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await shoppingListService.ApproveAsync(parentId, listId);
        return ToActionResult(result);
    }

    [HttpPut("{listId:guid}/reject")]
    [Authorize(Roles = RoleNames.Parent)]
    public async Task<IActionResult> Reject(Guid listId)
    {
        var parentId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await shoppingListService.RejectAsync(parentId, listId);
        return ToActionResult(result);
    }

    /// <summary>
    /// Verify a shopping item using OCR + AI semantic matching.
    /// 
    /// Workflow:
    /// 1. Child takes a photo of the price tag
    /// 2. Image is sent to OCR service (processed in-memory, never stored)
    /// 3. AI verifies if the price tag matches the shopping item
    /// 4. Returns match result with confidence score
    /// 
    /// IMPORTANT: Image is NOT stored - processed in-memory and immediately discarded.
    /// </summary>
    /// <param name="listId">Shopping list ID</param>
    /// <param name="itemId">Shopping item ID to verify</param>
    /// <param name="request">Request containing base64-encoded image</param>
    /// <returns>Verification result with match status and confidence</returns>
    [HttpPost("{listId:guid}/items/{itemId:guid}/verify")]
    [Authorize(Roles = RoleNames.Child)]
    public async Task<IActionResult> VerifyItem(Guid listId, Guid itemId, [FromBody] VerifyItemRequest request)
    {
        var childId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // First, get the item to verify it exists and belongs to the child
        var itemResult = await shoppingListService.GetItemAsync(childId, listId, itemId);
        if (!itemResult.Success)
        {
            return StatusCode(
                itemResult.StatusCode ?? StatusCodes.Status400BadRequest,
                new { error = itemResult.Error });
        }

        var item = itemResult.Data!;

        // Check if item is already completed
        if (item.IsCompleted)
        {
            return BadRequest(new { error = "Ovaj artikal je već označen kao kupljen." });
        }

        // Call OCR verification service
        // Image is processed in-memory by the OCR service and never stored
        var verifyResult = await ocrVerificationService.VerifyItemAsync(item.Name, request.ImageBase64);

        if (!verifyResult.Success)
        {
            return StatusCode(
                verifyResult.StatusCode ?? StatusCodes.Status400BadRequest,
                new { error = verifyResult.Error });
        }

        return Ok(verifyResult.Data);
    }

    private IActionResult ToActionResult<T>(ServiceResult<T> result)
    {
        return result.Success
            ? Ok(result.Data)
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, new { error = result.Error });
    }
}
