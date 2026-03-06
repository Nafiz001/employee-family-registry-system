using EmployeeRegistry.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EmployeeRegistry.Infrastructure.Data.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.NID)
            .IsRequired()
            .HasMaxLength(17);

        builder.HasIndex(e => e.NID)
            .IsUnique();

        builder.Property(e => e.Phone)
            .IsRequired()
            .HasMaxLength(15);

        builder.Property(e => e.Department)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.BasicSalary)
            .HasColumnType("decimal(18,2)");

        builder.HasOne(e => e.Spouse)
            .WithOne(s => s.Employee)
            .HasForeignKey<Spouse>(s => s.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Children)
            .WithOne(c => c.Employee)
            .HasForeignKey(c => c.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
