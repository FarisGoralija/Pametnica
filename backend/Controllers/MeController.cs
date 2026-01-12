using System.Security.Claims;
using backend.Constants;
using backend.DTOs.Me;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using static backend.Constants.PolicyNames;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{RoleNames.Parent},{RoleNames.Child}")]
public class MeController(
    IAuthorizationService authorizationService,
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetSelf()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
        {
            return Unauthorized();
        }

        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Unauthorized();
        }

        if (User.IsInRole(RoleNames.Child))
        {
            var resource = new ApplicationUser { Id = userId };
            var authResult = await authorizationService.AuthorizeAsync(User, resource, ChildSelf);
            if (!authResult.Succeeded)
            {
                return Forbid();
            }
        }

        var response = new MeProfileResponse
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            MonthlyAllowance = User.IsInRole(RoleNames.Child) ? user.MonthlyAllowance : null,
            CurrentBalance = User.IsInRole(RoleNames.Child) ? user.CurrentBalance : null,
            Points = User.IsInRole(RoleNames.Child) ? user.Points : null
        };

        return Ok(response);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSelf([FromBody] UpdateProfileRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
        {
            return Unauthorized();
        }

        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Unauthorized();
        }

        if (!string.IsNullOrWhiteSpace(request.FirstName))
        {
            user.FirstName = request.FirstName.Trim();
        }
        if (!string.IsNullOrWhiteSpace(request.LastName))
        {
            user.LastName = request.LastName.Trim();
        }

        user.FullName = $"{user.FirstName} {user.LastName}".Trim();

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var email = request.Email.Trim();
            var setEmailResult = await userManager.SetEmailAsync(user, email);
            if (!setEmailResult.Succeeded)
            {
                var error = string.Join("; ", setEmailResult.Errors.Select(e => e.Description));
                return StatusCode(StatusCodes.Status400BadRequest, new { error });
            }

            var setUserNameResult = await userManager.SetUserNameAsync(user, email);
            if (!setUserNameResult.Succeeded)
            {
                var error = string.Join("; ", setUserNameResult.Errors.Select(e => e.Description));
                return StatusCode(StatusCodes.Status400BadRequest, new { error });
            }
        }

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var error = string.Join("; ", updateResult.Errors.Select(e => e.Description));
            return StatusCode(StatusCodes.Status400BadRequest, new { error });
        }

        var response = new MeProfileResponse
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            MonthlyAllowance = User.IsInRole(RoleNames.Child) ? user.MonthlyAllowance : null,
            CurrentBalance = User.IsInRole(RoleNames.Child) ? user.CurrentBalance : null,
            Points = User.IsInRole(RoleNames.Child) ? user.Points : null
        };

        return Ok(response);
    }
}
