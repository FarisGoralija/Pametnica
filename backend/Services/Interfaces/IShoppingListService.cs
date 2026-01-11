using backend.DTOs.ShoppingLists;
using backend.Models;

namespace backend.Services.Interfaces;

public interface IShoppingListService
{
    // Child operations
    Task<ServiceResult<ShoppingListDto>> CreateAsync(string childId, CreateShoppingListRequest request);
    Task<ServiceResult<ShoppingListItemDto>> AddItemAsync(string childId, Guid listId, CreateShoppingListItemRequest request);
    Task<ServiceResult<ShoppingListItemDto>> UpdateItemAsync(string userId, bool isParent, Guid listId, Guid itemId, UpdateShoppingListItemRequest request);
    Task<ServiceResult<bool>> RemoveItemAsync(string userId, bool isParent, Guid listId, Guid itemId);
    Task<ServiceResult<ShoppingListDto>> SubmitAsync(string childId, Guid listId);
    Task<ServiceResult<ShoppingListDto>> CompleteItemAsync(string childId, Guid listId, Guid itemId, decimal price);
    Task<ServiceResult<IEnumerable<ShoppingListDto>>> GetChildPendingAsync(string childId);
    Task<ServiceResult<IEnumerable<ShoppingListDto>>> GetChildActiveAsync(string childId);
    Task<ServiceResult<IEnumerable<ShoppingListDto>>> GetChildHistoryAsync(string childId);

    // Parent operations
    Task<ServiceResult<IEnumerable<ShoppingListDto>>> GetParentPendingAsync(string parentId, string childId);
    Task<ServiceResult<IEnumerable<ShoppingListDto>>> GetParentActiveAsync(string parentId, string childId);
    Task<ServiceResult<ShoppingListDto>> ApproveAsync(string parentId, Guid listId);
    Task<ServiceResult<ShoppingListDto>> RejectAsync(string parentId, Guid listId);
}
