using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.ShoppingLists;

public class UpdateShoppingListTitleRequest
{
    [Required]
    public string Title { get; set; } = string.Empty;
}
