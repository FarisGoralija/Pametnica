namespace backend.DTOs.ShoppingLists;

public class ShoppingListItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal? Price { get; set; }
    public bool IsCompleted { get; set; }
}
