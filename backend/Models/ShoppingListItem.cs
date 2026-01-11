using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class ShoppingListItem
{
    public Guid Id { get; set; }

    [Required]
    public Guid ShoppingListId { get; set; }
    public ShoppingList? ShoppingList { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Price { get; set; }

    public bool IsCompleted { get; set; }
}
