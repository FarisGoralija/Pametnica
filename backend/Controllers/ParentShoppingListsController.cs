using System.Security.Claims;
using backend.Constants;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/children/{childId}/shopping-lists")]
[Authorize(Roles = RoleNames.Parent)]
public class ParentShoppingListsController(IShoppingListService shoppingListService) : ControllerBase
{
    [HttpGet("pending")]
    public async Task<IActionResult> GetPending(string childId)
    {
        var parentId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await shoppingListService.GetParentPendingAsync(parentId, childId);
        return result.Success
            ? Ok(result.Data)
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, new { error = result.Error });
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActive(string childId)
    {
        var parentId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await shoppingListService.GetParentActiveAsync(parentId, childId);
        return result.Success
            ? Ok(result.Data)
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, new { error = result.Error });
    }
}
