using backend.Constants;
using backend.Data;
using backend.DTOs.ShoppingLists;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class ShoppingListService(
    ApplicationDbContext dbContext) : IShoppingListService
{
    public async Task<ServiceResult<ShoppingListDto>> CreateAsync(string childId, CreateShoppingListRequest request)
    {
        var child = await GetChildAsync(childId);
        if (child is null)
        {
            return ServiceResult<ShoppingListDto>.Fail("Child not found.", StatusCodes.Status404NotFound);
        }

        var list = new ShoppingList
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            ChildId = childId,
            Type = request.Type,
            Status = request.Type == ShoppingListType.Emergency ? ShoppingListStatus.Approved : ShoppingListStatus.Pending,
            TotalCost = 0,
            CreatedAt = DateTime.UtcNow
        };

        await dbContext.ShoppingLists.AddAsync(list);
        await dbContext.SaveChangesAsync();

        return ServiceResult<ShoppingListDto>.Ok(ToDto(list));
    }

    public async Task<ServiceResult<ShoppingListItemDto>> AddItemAsync(string childId, Guid listId, CreateShoppingListItemRequest request)
    {
        var list = await dbContext.ShoppingLists
            .Include(l => l.Child)
            .FirstOrDefaultAsync(l => l.Id == listId);

        if (list is null)
        {
            return ServiceResult<ShoppingListItemDto>.Fail("List not found.", StatusCodes.Status404NotFound);
        }

        if (!string.Equals(list.ChildId, childId, StringComparison.OrdinalIgnoreCase))
        {
            return ServiceResult<ShoppingListItemDto>.Fail("Forbidden.", StatusCodes.Status403Forbidden);
        }

        var canAdd = list.Status == ShoppingListStatus.Pending ||
                     (list.Type == ShoppingListType.Emergency && list.Status == ShoppingListStatus.Approved);
        if (!canAdd)
        {
            return ServiceResult<ShoppingListItemDto>.Fail("Cannot add items to this list.", StatusCodes.Status400BadRequest);
        }

        var item = new ShoppingListItem
        {
            Id = Guid.NewGuid(),
            ShoppingListId = listId,
            Name = request.Name,
            IsCompleted = false
        };

        await dbContext.ShoppingListItems.AddAsync(item);
        await dbContext.SaveChangesAsync();

        return ServiceResult<ShoppingListItemDto>.Ok(ToDto(item));
    }

    public async Task<ServiceResult<ShoppingListItemDto>> UpdateItemAsync(string userId, bool isParent, Guid listId, Guid itemId, UpdateShoppingListItemRequest request)
    {
        var list = await dbContext.ShoppingLists
            .Include(l => l.Child)
            .FirstOrDefaultAsync(l => l.Id == listId);

        if (list is null)
        {
            return ServiceResult<ShoppingListItemDto>.Fail("List not found.", StatusCodes.Status404NotFound);
        }

        if (isParent)
        {
            if (!await ParentOwnsList(userId, list))
            {
                return ServiceResult<ShoppingListItemDto>.Fail("Forbidden.", StatusCodes.Status403Forbidden);
            }

            if (list.Status != ShoppingListStatus.Pending)
            {
                return ServiceResult<ShoppingListItemDto>.Fail("Parent can only modify items while list is pending.", StatusCodes.Status400BadRequest);
            }
        }
        else
        {
            if (!string.Equals(list.ChildId, userId, StringComparison.OrdinalIgnoreCase))
            {
                return ServiceResult<ShoppingListItemDto>.Fail("Forbidden.", StatusCodes.Status403Forbidden);
            }

            var childCanModify = list.Status == ShoppingListStatus.Pending ||
                                 (list.Type == ShoppingListType.Emergency && list.Status == ShoppingListStatus.Approved);
            if (!childCanModify)
            {
                return ServiceResult<ShoppingListItemDto>.Fail("Cannot modify items on this list.", StatusCodes.Status400BadRequest);
            }
        }

        var item = await dbContext.ShoppingListItems.FirstOrDefaultAsync(i => i.Id == itemId && i.ShoppingListId == listId);
        if (item is null)
        {
            return ServiceResult<ShoppingListItemDto>.Fail("Item not found.", StatusCodes.Status404NotFound);
        }

        if (item.IsCompleted)
        {
            return ServiceResult<ShoppingListItemDto>.Fail("Completed items cannot be modified.", StatusCodes.Status400BadRequest);
        }

        item.Name = request.Name;
        item.Price = request.Price;

        await dbContext.SaveChangesAsync();
        return ServiceResult<ShoppingListItemDto>.Ok(ToDto(item));
    }

    public async Task<ServiceResult<bool>> RemoveItemAsync(string userId, bool isParent, Guid listId, Guid itemId)
    {
        var list = await dbContext.ShoppingLists
            .Include(l => l.Child)
            .FirstOrDefaultAsync(l => l.Id == listId);

        if (list is null)
        {
            return ServiceResult<bool>.Fail("List not found.", StatusCodes.Status404NotFound);
        }

        if (isParent)
        {
            if (!await ParentOwnsList(userId, list))
            {
                return ServiceResult<bool>.Fail("Forbidden.", StatusCodes.Status403Forbidden);
            }

            if (list.Status != ShoppingListStatus.Pending)
            {
                return ServiceResult<bool>.Fail("Parent can only remove items while list is pending.", StatusCodes.Status400BadRequest);
            }
        }
        else
        {
            if (!string.Equals(list.ChildId, userId, StringComparison.OrdinalIgnoreCase))
            {
                return ServiceResult<bool>.Fail("Forbidden.", StatusCodes.Status403Forbidden);
            }

            var childCanModify = list.Status == ShoppingListStatus.Pending ||
                                 (list.Type == ShoppingListType.Emergency && list.Status == ShoppingListStatus.Approved);
            if (!childCanModify)
            {
                return ServiceResult<bool>.Fail("Cannot remove items on this list.", StatusCodes.Status400BadRequest);
            }
        }

        var item = await dbContext.ShoppingListItems.FirstOrDefaultAsync(i => i.Id == itemId && i.ShoppingListId == listId);
        if (item is null)
        {
            return ServiceResult<bool>.Fail("Item not found.", StatusCodes.Status404NotFound);
        }

        if (item.IsCompleted)
        {
            return ServiceResult<bool>.Fail("Completed items cannot be removed.", StatusCodes.Status400BadRequest);
        }

        dbContext.ShoppingListItems.Remove(item);
        await dbContext.SaveChangesAsync();
        return ServiceResult<bool>.Ok(true);
    }

    public async Task<ServiceResult<ShoppingListDto>> SubmitAsync(string childId, Guid listId)
    {
        var list = await dbContext.ShoppingLists.FirstOrDefaultAsync(l => l.Id == listId);
        if (list is null)
        {
            return ServiceResult<ShoppingListDto>.Fail("List not found.", StatusCodes.Status404NotFound);
        }

        if (!string.Equals(list.ChildId, childId, StringComparison.OrdinalIgnoreCase))
        {
            return ServiceResult<ShoppingListDto>.Fail("Forbidden.", StatusCodes.Status403Forbidden);
        }

        if (list.Type != ShoppingListType.Normal || list.Status != ShoppingListStatus.Pending)
        {
            return ServiceResult<ShoppingListDto>.Fail("Only pending normal lists can be submitted.", StatusCodes.Status400BadRequest);
        }

        // Submission keeps status pending; parent will approve/reject.
        await dbContext.SaveChangesAsync();
        return ServiceResult<ShoppingListDto>.Ok(ToDto(list));
    }

    public async Task<ServiceResult<ShoppingListDto>> CompleteItemAsync(string childId, Guid listId, Guid itemId, decimal price)
    {
        var list = await dbContext.ShoppingLists
            .Include(l => l.Items)
            .Include(l => l.Child)
            .FirstOrDefaultAsync(l => l.Id == listId);

        if (list is null)
        {
            return ServiceResult<ShoppingListDto>.Fail("List not found.", StatusCodes.Status404NotFound);
        }

        if (!string.Equals(list.ChildId, childId, StringComparison.OrdinalIgnoreCase))
        {
            return ServiceResult<ShoppingListDto>.Fail("Forbidden.", StatusCodes.Status403Forbidden);
        }

        if (list.Status != ShoppingListStatus.Approved)
        {
            return ServiceResult<ShoppingListDto>.Fail("Only approved lists can be completed.", StatusCodes.Status400BadRequest);
        }

        var item = list.Items.FirstOrDefault(i => i.Id == itemId);
        if (item is null)
        {
            return ServiceResult<ShoppingListDto>.Fail("Item not found.", StatusCodes.Status404NotFound);
        }

        if (item.IsCompleted)
        {
            return ServiceResult<ShoppingListDto>.Fail("Item already completed.", StatusCodes.Status400BadRequest);
        }

        item.Price = price;
        item.IsCompleted = true;

        // If all items completed and priced, finalize.
        if (list.Items.All(i => i.IsCompleted && i.Price.HasValue))
        {
            await using var transaction = await dbContext.Database.BeginTransactionAsync();
            try
            {
                var total = list.Items.Sum(i => i.Price ?? 0);
                list.TotalCost = total;

                if (list.Child is null)
                {
                    list.Child = await dbContext.Users.FirstAsync(u => u.Id == list.ChildId);
                }

                if (list.Child.CurrentBalance < total)
                {
                    await transaction.RollbackAsync();
                    return ServiceResult<ShoppingListDto>.Fail("Insufficient balance to complete list.", StatusCodes.Status400BadRequest);
                }

                list.Child.CurrentBalance -= total;
                list.Child.Points += 10;

                await dbContext.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        else
        {
            await dbContext.SaveChangesAsync();
        }

        return ServiceResult<ShoppingListDto>.Ok(ToDto(list));
    }

    public async Task<ServiceResult<IEnumerable<ShoppingListDto>>> GetChildPendingAsync(string childId)
    {
        var lists = await dbContext.ShoppingLists
            .Where(l => l.ChildId == childId && l.Status == ShoppingListStatus.Pending)
            .OrderByDescending(l => l.CreatedAt)
            .Include(l => l.Items)
            .ToListAsync();

        return ServiceResult<IEnumerable<ShoppingListDto>>.Ok(lists.Select(ToDto));
    }

    public async Task<ServiceResult<IEnumerable<ShoppingListDto>>> GetChildActiveAsync(string childId)
    {
        var lists = await dbContext.ShoppingLists
            .Where(l =>
                l.ChildId == childId &&
                l.Status == ShoppingListStatus.Approved &&
                !(l.Items.Any() && l.Items.All(i => i.IsCompleted && i.Price.HasValue)))
            .OrderByDescending(l => l.CreatedAt)
            .Include(l => l.Items)
            .ToListAsync();

        return ServiceResult<IEnumerable<ShoppingListDto>>.Ok(lists.Select(ToDto));
    }

    public async Task<ServiceResult<IEnumerable<ShoppingListDto>>> GetChildHistoryAsync(string childId)
    {
        var lists = await dbContext.ShoppingLists
            .Where(l =>
                l.ChildId == childId &&
                (
                    l.Status == ShoppingListStatus.Rejected ||
                    (l.Status == ShoppingListStatus.Approved &&
                     l.Items.Any() &&
                     l.Items.All(i => i.IsCompleted && i.Price.HasValue))
                ))
            .OrderByDescending(l => l.CreatedAt)
            .Include(l => l.Items)
            .ToListAsync();

        return ServiceResult<IEnumerable<ShoppingListDto>>.Ok(lists.Select(ToDto));
    }

    public async Task<ServiceResult<IEnumerable<ShoppingListDto>>> GetParentPendingAsync(string parentId, string childId)
    {
        if (!await ParentOwnsChild(parentId, childId))
        {
            return ServiceResult<IEnumerable<ShoppingListDto>>.Fail("Forbidden.", StatusCodes.Status403Forbidden);
        }

        var lists = await dbContext.ShoppingLists
            .Where(l => l.ChildId == childId && l.Status == ShoppingListStatus.Pending)
            .OrderByDescending(l => l.CreatedAt)
            .Include(l => l.Items)
            .ToListAsync();

        return ServiceResult<IEnumerable<ShoppingListDto>>.Ok(lists.Select(ToDto));
    }

    public async Task<ServiceResult<IEnumerable<ShoppingListDto>>> GetParentActiveAsync(string parentId, string childId)
    {
        if (!await ParentOwnsChild(parentId, childId))
        {
            return ServiceResult<IEnumerable<ShoppingListDto>>.Fail("Forbidden.", StatusCodes.Status403Forbidden);
        }

        var lists = await dbContext.ShoppingLists
            .Where(l => l.ChildId == childId && l.Status == ShoppingListStatus.Approved)
            .OrderByDescending(l => l.CreatedAt)
            .Include(l => l.Items)
            .ToListAsync();

        return ServiceResult<IEnumerable<ShoppingListDto>>.Ok(lists.Select(ToDto));
    }

    public async Task<ServiceResult<ShoppingListDto>> ApproveAsync(string parentId, Guid listId)
    {
        var list = await dbContext.ShoppingLists
            .Include(l => l.Child)
            .FirstOrDefaultAsync(l => l.Id == listId);

        if (list is null)
        {
            return ServiceResult<ShoppingListDto>.Fail("List not found.", StatusCodes.Status404NotFound);
        }

        if (list.Type != ShoppingListType.Normal || list.Status != ShoppingListStatus.Pending)
        {
            return ServiceResult<ShoppingListDto>.Fail("Only pending normal lists can be approved.", StatusCodes.Status400BadRequest);
        }

        if (!await ParentOwnsList(parentId, list))
        {
            return ServiceResult<ShoppingListDto>.Fail("Forbidden.", StatusCodes.Status403Forbidden);
        }

        list.Status = ShoppingListStatus.Approved;
        await dbContext.SaveChangesAsync();
        return ServiceResult<ShoppingListDto>.Ok(ToDto(list));
    }

    public async Task<ServiceResult<ShoppingListDto>> RejectAsync(string parentId, Guid listId)
    {
        var list = await dbContext.ShoppingLists
            .Include(l => l.Child)
            .FirstOrDefaultAsync(l => l.Id == listId);

        if (list is null)
        {
            return ServiceResult<ShoppingListDto>.Fail("List not found.", StatusCodes.Status404NotFound);
        }

        if (list.Type != ShoppingListType.Normal || list.Status != ShoppingListStatus.Pending)
        {
            return ServiceResult<ShoppingListDto>.Fail("Only pending normal lists can be rejected.", StatusCodes.Status400BadRequest);
        }

        if (!await ParentOwnsList(parentId, list))
        {
            return ServiceResult<ShoppingListDto>.Fail("Forbidden.", StatusCodes.Status403Forbidden);
        }

        list.Status = ShoppingListStatus.Rejected;
        await dbContext.SaveChangesAsync();
        return ServiceResult<ShoppingListDto>.Ok(ToDto(list));
    }

    private async Task<ApplicationUser?> GetChildAsync(string childId) =>
        await dbContext.Users.FirstOrDefaultAsync(u => u.Id == childId && u.Role == RoleNames.Child);

    private async Task<bool> ParentOwnsChild(string parentId, string childId)
    {
        var child = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == childId && u.Role == RoleNames.Child);
        return child is not null && string.Equals(child.ParentId, parentId, StringComparison.OrdinalIgnoreCase);
    }

    private async Task<bool> ParentOwnsList(string parentId, ShoppingList list)
    {
        if (list.Child is not null)
        {
            return string.Equals(list.Child.ParentId, parentId, StringComparison.OrdinalIgnoreCase);
        }

        var child = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == list.ChildId);
        return child is not null && string.Equals(child.ParentId, parentId, StringComparison.OrdinalIgnoreCase);
    }

    private static ShoppingListDto ToDto(ShoppingList list) => new()
    {
        Id = list.Id,
        Title = list.Title,
        Type = list.Type,
        Status = list.Status,
        TotalCost = list.TotalCost,
        CreatedAt = list.CreatedAt,
        Items = list.Items.Select(ToDto).ToList()
    };

    private static ShoppingListItemDto ToDto(ShoppingListItem item) => new()
    {
        Id = item.Id,
        Name = item.Name,
        Price = item.Price,
        IsCompleted = item.IsCompleted
    };
}
