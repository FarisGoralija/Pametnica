using backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<ShoppingList> ShoppingLists => Set<ShoppingList>();
    public DbSet<ShoppingListItem> ShoppingListItems => Set<ShoppingListItem>();

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

        builder.Entity<ShoppingList>(entity =>
        {
            entity.Property(s => s.Title).IsRequired().HasMaxLength(200);
            entity.Property(s => s.TotalCost).HasPrecision(18, 2);
            entity.Property(s => s.Type).HasConversion<int>();
            entity.Property(s => s.Status).HasConversion<int>();

            entity.HasOne(s => s.Child)
                .WithMany(u => u.ShoppingLists)
                .HasForeignKey(s => s.ChildId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(s => s.ChildId);
            entity.HasIndex(s => s.Status);
            entity.HasIndex(s => s.CreatedAt);
        });

        builder.Entity<ShoppingListItem>(entity =>
        {
            entity.Property(i => i.Name).IsRequired().HasMaxLength(200);
            entity.Property(i => i.Price).HasPrecision(18, 2);

            entity.HasOne(i => i.ShoppingList)
                .WithMany(s => s.Items)
                .HasForeignKey(i => i.ShoppingListId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
