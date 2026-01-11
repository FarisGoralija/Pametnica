using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.DTOs.ShoppingLists;

public class CreateShoppingListRequest
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public ShoppingListType Type { get; set; }
}
