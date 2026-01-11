using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.ShoppingLists;

public class CompleteItemRequest
{
    [Range(0.01, double.MaxValue)]
    public decimal Price { get; set; }
}
