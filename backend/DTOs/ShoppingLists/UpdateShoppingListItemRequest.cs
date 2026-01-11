using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.ShoppingLists;

public class UpdateShoppingListItemRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public decimal? Price { get; set; }
}
