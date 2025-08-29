using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configurations;

public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Description)
            .IsRequired()
            .HasMaxLength(500);
            
        builder.Property(e => e.Amount)
            .HasPrecision(18, 2);
            
        builder.Property(e => e.Category)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(e => e.Subcategory)
            .HasMaxLength(100);
            
        builder.Property(e => e.Date)
            .IsRequired();
            
        builder.Property(e => e.RawText)
            .HasMaxLength(1000);
            
        builder.Property(e => e.Notes)
            .HasMaxLength(2000);
            
        builder.Property(e => e.Location)
            .HasMaxLength(200);
            
        builder.Property(e => e.PaymentMethod)
            .HasMaxLength(50);
            
        builder.Property(e => e.CreatedAt)
            .IsRequired();
            
        builder.Property(e => e.UpdatedAt)
            .IsRequired();
            
        // Configure Tags as JSON column
        builder.Property(e => e.Tags)
            .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
            )
            .HasMaxLength(500);
            
        // Index for better query performance
        builder.HasIndex(e => e.Category);
        builder.HasIndex(e => e.Date);
        builder.HasIndex(e => e.CreatedAt);
    }
}