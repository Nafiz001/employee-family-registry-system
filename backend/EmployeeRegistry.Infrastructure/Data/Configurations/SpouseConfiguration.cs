using EmployeeRegistry.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EmployeeRegistry.Infrastructure.Data.Configurations;

public class SpouseConfiguration : IEntityTypeConfiguration<Spouse>
{
    public void Configure(EntityTypeBuilder<Spouse> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.NID)
            .IsRequired()
            .HasMaxLength(17);

        builder.HasIndex(s => s.NID)
            .IsUnique();
    }
}
