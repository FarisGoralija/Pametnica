using backend.DTOs.Children;
using backend.Models;

namespace backend.Services.Interfaces;

public interface IChildService
{
    Task<ServiceResult<ChildDto>> CreateChildAsync(string parentId, CreateChildRequest request);
    Task<ServiceResult<IEnumerable<ChildDto>>> GetChildrenAsync(string parentId);
    Task<ServiceResult<ChildDto>> GetChildAsync(string parentId, string childId);
    Task<ServiceResult<ChildDto>> UpdateAllowanceAsync(string parentId, string childId, decimal monthlyAllowance);
    Task<ServiceResult<ChildDto>> ResetBalanceToAllowanceAsync(string parentId, string childId);
    Task<ServiceResult<ChildDto>> DeductBalanceAsync(string requesterId, string childId, bool isParent, decimal amount);
    Task<ServiceResult<ChildDto>> DeductPointsAsync(string parentId, string childId, int points);
    Task<ServiceResult<ChildSummaryDto>> GetChildSelfAsync(string childId);
}
