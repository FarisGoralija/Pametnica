using backend.Constants;
using backend.DTOs.Auth;
using backend.Models;
using backend.Options;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class AuthService(
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    ITokenService tokenService,
    IOptions<JwtSettings> jwtOptions) : IAuthService
{
    private readonly JwtSettings _jwt = jwtOptions.Value;

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

        return await IssueTokensAsync(user);
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

        return await IssueTokensAsync(user);
    }

    public async Task<ServiceResult<AuthResponseDto>> RefreshTokenAsync(RefreshTokenRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return ServiceResult<AuthResponseDto>.Fail("Refresh token is required.", StatusCodes.Status400BadRequest);
        }

        var refreshTokenHash = tokenService.HashRefreshToken(request.RefreshToken);
        var user = await userManager.Users.FirstOrDefaultAsync(u => u.RefreshTokenHash == refreshTokenHash);
        if (user is null || user.RefreshTokenExpiresAt is null || user.RefreshTokenExpiresAt <= DateTime.UtcNow)
        {
            return ServiceResult<AuthResponseDto>.Fail("Invalid refresh token.", StatusCodes.Status401Unauthorized);
        }

        return await IssueTokensAsync(user);
    }

    public async Task<ServiceResult<bool>> LogoutAsync(RefreshTokenRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return ServiceResult<bool>.Fail("Refresh token is required.", StatusCodes.Status400BadRequest);
        }

        var refreshTokenHash = tokenService.HashRefreshToken(request.RefreshToken);
        var user = await userManager.Users.FirstOrDefaultAsync(u => u.RefreshTokenHash == refreshTokenHash);
        if (user is null)
        {
            return ServiceResult<bool>.Ok(true);
        }

        user.RefreshTokenHash = null;
        user.RefreshTokenExpiresAt = null;
        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var error = string.Join("; ", updateResult.Errors.Select(e => e.Description));
            return ServiceResult<bool>.Fail(error, StatusCodes.Status400BadRequest);
        }

        return ServiceResult<bool>.Ok(true);
    }

    private async Task<ServiceResult<AuthResponseDto>> IssueTokensAsync(ApplicationUser user)
    {
        var accessToken = await tokenService.GenerateTokenAsync(user);
        var refreshToken = tokenService.GenerateRefreshToken();

        user.RefreshTokenHash = tokenService.HashRefreshToken(refreshToken);
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(_jwt.RefreshTokenExpiryDays);

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var error = string.Join("; ", updateResult.Errors.Select(e => e.Description));
            return ServiceResult<AuthResponseDto>.Fail(error, StatusCodes.Status400BadRequest);
        }

        return ServiceResult<AuthResponseDto>.Ok(ToAuthResponse(user, accessToken, refreshToken));
    }

    private static AuthResponseDto ToAuthResponse(ApplicationUser user, string token, string refreshToken) => new()
    {
        UserId = user.Id,
        Email = user.Email ?? string.Empty,
        FullName = user.FullName,
        Role = user.Role,
        Token = token,
        RefreshToken = refreshToken,
        RefreshTokenExpiresAt = user.RefreshTokenExpiresAt ?? DateTime.UtcNow
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
