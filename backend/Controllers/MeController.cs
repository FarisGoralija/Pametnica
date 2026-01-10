using System.Security.Claims;
using backend.Constants;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static backend.Constants.PolicyNames;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = RoleNames.Child)]
public class MeController(IChildService childService, IAuthorizationService authorizationService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetSelf()
    {
        var childId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (childId is null)
        {
            return Unauthorized();
        }

        var resource = new ApplicationUser { Id = childId };
        var authResult = await authorizationService.AuthorizeAsync(User, resource, ChildSelf);
        if (!authResult.Succeeded)
        {
            return Forbid();
        }

        var result = await childService.GetChildSelfAsync(childId);
        return result.Success
            ? Ok(result.Data)
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, new { error = result.Error });
    }
}
