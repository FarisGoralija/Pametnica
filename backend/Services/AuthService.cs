using backend.Constants;
using backend.DTOs.Auth;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;

namespace backend.Services;

public class AuthService(
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    ITokenService tokenService) : IAuthService
{
    public async Task<ServiceResult<AuthResponseDto>> RegisterParentAsync(RegisterParentRequest request)
    {
        var existingUser = await userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
        {
            return ServiceResult<AuthResponseDto>.Fail("Email already registered.", StatusCodes.Status409Conflict);
        }

        await EnsureRolesAsync();

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = RoleNames.Parent
        };

        var createResult = await userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            var error = string.Join("; ", createResult.Errors.Select(e => e.Description));
            return ServiceResult<AuthResponseDto>.Fail(error, StatusCodes.Status400BadRequest);
        }

        await userManager.AddToRoleAsync(user, RoleNames.Parent);

        var token = await tokenService.GenerateTokenAsync(user);
        return ServiceResult<AuthResponseDto>.Ok(ToAuthResponse(user, token));
    }

    public async Task<ServiceResult<AuthResponseDto>> LoginParentAsync(LoginRequest request) =>
        await LoginInternalAsync(request, RoleNames.Parent);

    public async Task<ServiceResult<AuthResponseDto>> LoginChildAsync(LoginRequest request) =>
        await LoginInternalAsync(request, RoleNames.Child);

    private async Task<ServiceResult<AuthResponseDto>> LoginInternalAsync(LoginRequest request, string expectedRole)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return ServiceResult<AuthResponseDto>.Fail("Invalid credentials.", StatusCodes.Status401Unauthorized);
        }

        var passwordValid = await userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordValid)
        {
            return ServiceResult<AuthResponseDto>.Fail("Invalid credentials.", StatusCodes.Status401Unauthorized);
        }

        var roles = await userManager.GetRolesAsync(user);
        if (!roles.Contains(expectedRole, StringComparer.OrdinalIgnoreCase) || !string.Equals(user.Role, expectedRole, StringComparison.OrdinalIgnoreCase))
        {
            return ServiceResult<AuthResponseDto>.Fail("User not allowed for this operation.", StatusCodes.Status403Forbidden);
        }

        var token = await tokenService.GenerateTokenAsync(user);
        return ServiceResult<AuthResponseDto>.Ok(ToAuthResponse(user, token));
    }

    private static AuthResponseDto ToAuthResponse(ApplicationUser user, string token) => new()
    {
        UserId = user.Id,
        Email = user.Email ?? string.Empty,
        FullName = user.FullName,
        Role = user.Role,
        Token = token
    };

    private async Task EnsureRolesAsync()
    {
        if (!await roleManager.RoleExistsAsync(RoleNames.Parent))
        {
            await roleManager.CreateAsync(new IdentityRole(RoleNames.Parent));
        }

        if (!await roleManager.RoleExistsAsync(RoleNames.Child))
        {
            await roleManager.CreateAsync(new IdentityRole(RoleNames.Child));
        }
    }
}
