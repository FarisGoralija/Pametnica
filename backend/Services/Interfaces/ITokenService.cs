using backend.Models;

namespace backend.Services.Interfaces;

public interface ITokenService
{
    Task<string> GenerateTokenAsync(ApplicationUser user);
    string GenerateRefreshToken();
    string HashRefreshToken(string refreshToken);
}
