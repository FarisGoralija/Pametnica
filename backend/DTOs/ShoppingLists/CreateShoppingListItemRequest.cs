using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.ShoppingLists;

public class CreateShoppingListItemRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;
}
