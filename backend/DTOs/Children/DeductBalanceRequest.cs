using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Children;

public class DeductBalanceRequest
{
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }
}
