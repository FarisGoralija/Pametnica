using backend.DTOs.Auth;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register-parent")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterParent([FromBody] RegisterParentRequest request)
    {
        var result = await authService.RegisterParentAsync(request);
        return result.Success
            ? CreatedAtAction(nameof(RegisterParent), result.Data)
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, new { error = result.Error });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> LoginParent([FromBody] LoginRequest request)
    {
        var result = await authService.LoginParentAsync(request);
        return result.Success
            ? Ok(result.Data)
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, new { error = result.Error });
    }

    [HttpPost("login-child")]
    [AllowAnonymous]
    public async Task<IActionResult> LoginChild([FromBody] LoginRequest request)
    {
        var result = await authService.LoginChildAsync(request);
        return result.Success
            ? Ok(result.Data)
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, new { error = result.Error });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        var result = await authService.RefreshTokenAsync(request);
        return result.Success
            ? Ok(result.Data)
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, new { error = result.Error });
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request)
    {
        var result = await authService.LogoutAsync(request);
        return result.Success
            ? Ok(new { success = true })
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, new { error = result.Error });
    }
}
