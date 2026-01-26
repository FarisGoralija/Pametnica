using backend.DTOs.Auth;
using backend.Models;

namespace backend.Services.Interfaces;

public interface IAuthService
{
    Task<ServiceResult<AuthResponseDto>> RegisterParentAsync(RegisterParentRequest request);
    Task<ServiceResult<AuthResponseDto>> LoginParentAsync(LoginRequest request);
    Task<ServiceResult<AuthResponseDto>> LoginChildAsync(LoginRequest request);
    Task<ServiceResult<AuthResponseDto>> RefreshTokenAsync(RefreshTokenRequest request);
    Task<ServiceResult<bool>> LogoutAsync(RefreshTokenRequest request);
}
