using System.Security.Claims;
using backend.Constants;
using backend.DTOs.Children;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static backend.Constants.PolicyNames;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = RoleNames.Parent)]
public class ChildrenController(
    IChildService childService,
    UserManager<ApplicationUser> userManager,
    IAuthorizationService authorizationService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateChild([FromBody] CreateChildRequest request)
    {
        var parentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (parentId is null)
        {
            return Unauthorized();
        }

        var result = await childService.CreateChildAsync(parentId, request);
        return result.Success
            ? CreatedAtAction(nameof(GetChild), new { childId = result.Data!.Id }, result.Data)
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, new { error = result.Error });
    }

    [HttpGet]
    public async Task<IActionResult> GetChildren()
    {
        var parentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await childService.GetChildrenAsync(parentId!);
        return Ok(result.Data);
    }

    [HttpGet("{childId}")]
    public async Task<IActionResult> GetChild(string childId)
    {
        var ownershipCheck = await AuthorizeParentOwnership(childId);
        if (ownershipCheck is not null)
        {
            return ownershipCheck;
        }

        var parentId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await childService.GetChildAsync(parentId, childId);
        return result.Success
            ? Ok(result.Data)
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, new { error = result.Error });
    }

    [HttpPut("{childId}/allowance")]
    public async Task<IActionResult> UpdateAllowance(string childId, [FromBody] UpdateAllowanceRequest request)
    {
        var ownershipCheck = await AuthorizeParentOwnership(childId);
        if (ownershipCheck is not null)
        {
            return ownershipCheck;
        }

        var parentId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await childService.UpdateAllowanceAsync(parentId, childId, request.MonthlyAllowance);
        return result.Success
            ? Ok(result.Data)
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, new { error = result.Error });
    }

    [HttpPost("{childId}/deduct-balance")]
    public async Task<IActionResult> DeductBalance(string childId, [FromBody] DeductBalanceRequest request)
    {
        var ownershipCheck = await AuthorizeParentOwnership(childId);
        if (ownershipCheck is not null)
        {
            return ownershipCheck;
        }

        var parentId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await childService.DeductBalanceAsync(parentId, childId, request.Amount);
        return result.Success
            ? Ok(result.Data)
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, new { error = result.Error });
    }

    [HttpPost("{childId}/deduct-points")]
    public async Task<IActionResult> DeductPoints(string childId, [FromBody] DeductPointsRequest request)
    {
        var ownershipCheck = await AuthorizeParentOwnership(childId);
        if (ownershipCheck is not null)
        {
            return ownershipCheck;
        }

        var parentId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await childService.DeductPointsAsync(parentId, childId, request.Points);
        return result.Success
            ? Ok(result.Data)
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, new { error = result.Error });
    }

    private async Task<IActionResult?> AuthorizeParentOwnership(string childId)
    {
        var child = await userManager.Users.FirstOrDefaultAsync(u => u.Id == childId && u.Role == RoleNames.Child);
        if (child is null)
        {
            return NotFound(new { error = "Child not found." });
        }

        var authResult = await authorizationService.AuthorizeAsync(User, child, ParentOwnership);
        if (!authResult.Succeeded)
        {
            return Forbid();
        }

        return null;
    }
}
