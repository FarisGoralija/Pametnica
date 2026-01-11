using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Children;

public class UpdateAllowanceRequest
{
    [Range(0, double.MaxValue)]
    public decimal MonthlyAllowance { get; set; }
}
