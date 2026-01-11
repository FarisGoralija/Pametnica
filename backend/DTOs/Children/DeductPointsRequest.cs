using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Children;

public class DeductPointsRequest
{
    [Range(1, int.MaxValue)]
    public int Points { get; set; }
}
