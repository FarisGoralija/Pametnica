using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Me;

public class UpdateProfileRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }

    [EmailAddress]
    public string? Email { get; set; }
}
