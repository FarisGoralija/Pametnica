using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace backend.Models;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;

    // Stored as a computed column for convenience in queries and responses.
    public string FullName { get; set; } = string.Empty;

    // Convenience role indicator alongside Identity roles for quick filtering.
    public string Role { get; set; } = null!;

    // Parent-child relationship
    public string? ParentId { get; set; }
    public ApplicationUser? Parent { get; set; }
    public ICollection<ApplicationUser> Children { get; set; } = new List<ApplicationUser>();
    public ICollection<ShoppingList> ShoppingLists { get; set; } = new List<ShoppingList>();

    // Child-only fields
    [Column(TypeName = "decimal(18,2)")]
    public decimal MonthlyAllowance { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal CurrentBalance { get; set; }

    public int Points { get; set; }

    // Refresh token storage (hashed) for long-lived sessions.
    public string? RefreshTokenHash { get; set; }
    public DateTime? RefreshTokenExpiresAt { get; set; }
}
