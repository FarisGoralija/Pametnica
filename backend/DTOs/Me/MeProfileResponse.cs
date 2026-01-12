namespace backend.DTOs.Me;

public class MeProfileResponse
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    // Child-only fields (null for parents)
    public decimal? MonthlyAllowance { get; set; }
    public decimal? CurrentBalance { get; set; }
    public int? Points { get; set; }
}
