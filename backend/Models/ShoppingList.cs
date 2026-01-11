using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class ShoppingList
{
    public Guid Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string ChildId { get; set; } = string.Empty;
    public ApplicationUser? Child { get; set; }

    public ShoppingListType Type { get; set; }
    public ShoppingListStatus Status { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalCost { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ShoppingListItem> Items { get; set; } = new List<ShoppingListItem>();
}
