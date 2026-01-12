using System.Linq.Expressions;
using backend.Constants;
using backend.Data;
using backend.DTOs.Children;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class ChildService(
    ApplicationDbContext dbContext,
    UserManager<ApplicationUser> userManager) : IChildService
{
    public async Task<ServiceResult<ChildDto>> CreateChildAsync(string parentId, CreateChildRequest request)
    {
        var parent = await userManager.FindByIdAsync(parentId);
        if (parent is null || !string.Equals(parent.Role, RoleNames.Parent, StringComparison.OrdinalIgnoreCase))
        {
            return ServiceResult<ChildDto>.Fail("Parent not found.", StatusCodes.Status404NotFound);
        }

        var existing = await userManager.FindByEmailAsync(request.Email);
        if (existing is not null)
        {
            return ServiceResult<ChildDto>.Fail("Email already in use.", StatusCodes.Status409Conflict);
        }

        var child = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = RoleNames.Child,
            ParentId = parentId,
            MonthlyAllowance = request.MonthlyAllowance,
            CurrentBalance = request.MonthlyAllowance,
            Points = 0
        };

        var createResult = await userManager.CreateAsync(child, request.Password);
        if (!createResult.Succeeded)
        {
            var error = string.Join("; ", createResult.Errors.Select(e => e.Description));
            return ServiceResult<ChildDto>.Fail(error, StatusCodes.Status400BadRequest);
        }

        await userManager.AddToRoleAsync(child, RoleNames.Child);

        return ServiceResult<ChildDto>.Ok(ToDto(child));
    }

    public async Task<ServiceResult<IEnumerable<ChildDto>>> GetChildrenAsync(string parentId)
    {
        var children = await dbContext.Users
            .Where(u => u.Role == RoleNames.Child && u.ParentId == parentId)
            .Select(ToDtoSelector)
            .ToListAsync();

        return ServiceResult<IEnumerable<ChildDto>>.Ok(children);
    }

    public async Task<ServiceResult<ChildDto>> GetChildAsync(string parentId, string childId)
    {
        var child = await dbContext.Users
            .Where(u => u.Id == childId && u.Role == RoleNames.Child)
            .FirstOrDefaultAsync();

        if (child is null)
        {
            return ServiceResult<ChildDto>.Fail("Child not found.", StatusCodes.Status404NotFound);
        }

        if (!string.Equals(child.ParentId, parentId, StringComparison.OrdinalIgnoreCase))
        {
            return ServiceResult<ChildDto>.Fail("Forbidden.", StatusCodes.Status403Forbidden);
        }

        return ServiceResult<ChildDto>.Ok(ToDto(child));
    }

    public async Task<ServiceResult<ChildDto>> UpdateAllowanceAsync(string parentId, string childId, decimal monthlyAllowance)
    {
        var child = await FindOwnedChild(parentId, childId);
        if (!child.Success || child.Data is null)
        {
            return ServiceResult<ChildDto>.Fail(child.Error ?? "Child not found.", child.StatusCode);
        }

        child.Data.MonthlyAllowance = monthlyAllowance;
        child.Data.CurrentBalance = monthlyAllowance;
        await dbContext.SaveChangesAsync();
        return ServiceResult<ChildDto>.Ok(ToDto(child.Data));
    }

    public async Task<ServiceResult<ChildDto>> ResetBalanceToAllowanceAsync(string parentId, string childId)
    {
        var child = await FindOwnedChild(parentId, childId);
        if (!child.Success || child.Data is null)
        {
            return ServiceResult<ChildDto>.Fail(child.Error ?? "Child not found.", child.StatusCode);
        }

        child.Data.CurrentBalance = child.Data.MonthlyAllowance;
        await dbContext.SaveChangesAsync();
        return ServiceResult<ChildDto>.Ok(ToDto(child.Data));
    }

    public async Task<ServiceResult<ChildDto>> DeductBalanceAsync(string requesterId, string childId, bool isParent, decimal amount)
    {
        var child = isParent
            ? await FindOwnedChild(requesterId, childId)
            : await FindChildSelf(childId);

        if (!child.Success || child.Data is null)
        {
            return ServiceResult<ChildDto>.Fail(child.Error ?? "Child not found.", child.StatusCode);
        }

        if (amount <= 0)
        {
            return ServiceResult<ChildDto>.Fail("Amount must be positive.", StatusCodes.Status400BadRequest);
        }

        if (child.Data.CurrentBalance < amount)
        {
            return ServiceResult<ChildDto>.Fail("Insufficient balance.", StatusCodes.Status400BadRequest);
        }

        child.Data.CurrentBalance -= amount;
        await dbContext.SaveChangesAsync();
        return ServiceResult<ChildDto>.Ok(ToDto(child.Data));
    }

    public async Task<ServiceResult<ChildDto>> DeductPointsAsync(string parentId, string childId, int points)
    {
        var child = await FindOwnedChild(parentId, childId);
        if (!child.Success || child.Data is null)
        {
            return ServiceResult<ChildDto>.Fail(child.Error ?? "Child not found.", child.StatusCode);
        }

        if (points <= 0)
        {
            return ServiceResult<ChildDto>.Fail("Points must be positive.", StatusCodes.Status400BadRequest);
        }

        if (child.Data.Points < points)
        {
            return ServiceResult<ChildDto>.Fail("Insufficient points.", StatusCodes.Status400BadRequest);
        }

        child.Data.Points -= points;
        await dbContext.SaveChangesAsync();
        return ServiceResult<ChildDto>.Ok(ToDto(child.Data));
    }

    public async Task<ServiceResult<ChildSummaryDto>> GetChildSelfAsync(string childId)
    {
        var child = await dbContext.Users
            .Where(u => u.Id == childId && u.Role == RoleNames.Child)
            .Select(u => new ChildSummaryDto
            {
                Id = u.Id,
                MonthlyAllowance = u.MonthlyAllowance,
                CurrentBalance = u.CurrentBalance,
                Points = u.Points
            })
            .FirstOrDefaultAsync();

        if (child is null)
        {
            return ServiceResult<ChildSummaryDto>.Fail("Child not found.", StatusCodes.Status404NotFound);
        }

        return ServiceResult<ChildSummaryDto>.Ok(child);
    }

    private async Task<ServiceResult<ApplicationUser>> FindOwnedChild(string parentId, string childId)
    {
        var child = await dbContext.Users
            .FirstOrDefaultAsync(u => u.Id == childId && u.Role == RoleNames.Child);

        if (child is null)
        {
            return ServiceResult<ApplicationUser>.Fail("Child not found.", StatusCodes.Status404NotFound);
        }

        if (!string.Equals(child.ParentId, parentId, StringComparison.OrdinalIgnoreCase))
        {
            return ServiceResult<ApplicationUser>.Fail("Forbidden.", StatusCodes.Status403Forbidden);
        }

        return ServiceResult<ApplicationUser>.Ok(child);
    }

    private async Task<ServiceResult<ApplicationUser>> FindChildSelf(string childId)
    {
        var child = await dbContext.Users
            .FirstOrDefaultAsync(u => u.Id == childId && u.Role == RoleNames.Child);

        return child is null
            ? ServiceResult<ApplicationUser>.Fail("Child not found.", StatusCodes.Status404NotFound)
            : ServiceResult<ApplicationUser>.Ok(child);
    }

    private static ChildDto ToDto(ApplicationUser user) => new()
    {
        Id = user.Id,
        Email = user.Email ?? string.Empty,
        FirstName = user.FirstName,
        LastName = user.LastName,
        FullName = user.FullName,
        MonthlyAllowance = user.MonthlyAllowance,
        CurrentBalance = user.CurrentBalance,
        Points = user.Points
    };

    private static readonly Expression<Func<ApplicationUser, ChildDto>> ToDtoSelector = user => new ChildDto
    {
        Id = user.Id,
        Email = user.Email ?? string.Empty,
        FirstName = user.FirstName,
        LastName = user.LastName,
        FullName = user.FullName,
        MonthlyAllowance = user.MonthlyAllowance,
        CurrentBalance = user.CurrentBalance,
        Points = user.Points
    };
}
