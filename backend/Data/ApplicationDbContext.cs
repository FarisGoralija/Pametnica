using backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.LastName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Role).IsRequired().HasMaxLength(20);

            entity.Property(u => u.FullName)
                .HasComputedColumnSql("[FirstName] + ' ' + [LastName]", stored: true);

            entity.HasMany(u => u.Children)
                .WithOne(u => u.Parent)
                .HasForeignKey(u => u.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(u => u.MonthlyAllowance).HasPrecision(18, 2);
            entity.Property(u => u.CurrentBalance).HasPrecision(18, 2);
        });
    }
}
