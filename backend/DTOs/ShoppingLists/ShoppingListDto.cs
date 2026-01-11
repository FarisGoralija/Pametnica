using backend.Models;

namespace backend.DTOs.ShoppingLists;

public class ShoppingListDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public ShoppingListType Type { get; set; }
    public ShoppingListStatus Status { get; set; }
    public decimal TotalCost { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ShoppingListItemDto> Items { get; set; } = new();
}
