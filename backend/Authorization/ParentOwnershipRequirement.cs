using System.Security.Claims;
using backend.Constants;
using backend.Models;
using Microsoft.AspNetCore.Authorization;

namespace backend.Authorization;

public class ParentOwnershipRequirement : IAuthorizationRequirement;

public class ParentOwnershipHandler : AuthorizationHandler<ParentOwnershipRequirement, ApplicationUser>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ParentOwnershipRequirement requirement,
        ApplicationUser resource)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isParent = context.User.IsInRole(RoleNames.Parent);

        if (isParent && !string.IsNullOrWhiteSpace(userId) &&
            string.Equals(resource.ParentId, userId, StringComparison.OrdinalIgnoreCase))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
