namespace backend.DTOs.Children;

public class ChildSummaryDto
{
    public string Id { get; set; } = string.Empty;
    public decimal MonthlyAllowance { get; set; }
    public decimal CurrentBalance { get; set; }
    public int Points { get; set; }
}
