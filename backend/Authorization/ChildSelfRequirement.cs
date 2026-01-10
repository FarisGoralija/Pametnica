using System.Security.Claims;
using backend.Constants;
using backend.Models;
using Microsoft.AspNetCore.Authorization;

namespace backend.Authorization;

public class ChildSelfRequirement : IAuthorizationRequirement;

public class ChildSelfHandler : AuthorizationHandler<ChildSelfRequirement, ApplicationUser>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ChildSelfRequirement requirement,
        ApplicationUser resource)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isChild = context.User.IsInRole(RoleNames.Child);

        if (isChild && !string.IsNullOrWhiteSpace(userId) &&
            string.Equals(resource.Id, userId, StringComparison.OrdinalIgnoreCase))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
