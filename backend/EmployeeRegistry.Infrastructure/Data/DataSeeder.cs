using EmployeeRegistry.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EmployeeRegistry.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Seed default admin user
        if (!await context.Users.AnyAsync())
        {
            context.Users.AddRange(
                new User
                {
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = UserRole.Admin
                },
                new User
                {
                    Username = "viewer",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Viewer@123"),
                    Role = UserRole.Viewer
                }
            );

            await context.SaveChangesAsync();
        }

        if (await context.Employees.AnyAsync())
            return;

        var employees = new List<Employee>
        {
            new()
            {
                Name = "Md. Rafiqul Islam",
                NID = "1990123456",          // 10 digits
                Phone = "+8801712345678",
                Department = "Engineering",
                BasicSalary = 85000,
                Spouse = new Spouse { Name = "Fatema Begum", NID = "1991234567" },   // 10 digits
                Children = new List<Child>
                {
                    new() { Name = "Ahnaf Islam", DateOfBirth = new DateTime(2015, 3, 12, 0, 0, 0, DateTimeKind.Utc) },
                    new() { Name = "Anika Islam", DateOfBirth = new DateTime(2018, 7, 25, 0, 0, 0, DateTimeKind.Utc) }
                }
            },
            new()
            {
                Name = "Taslima Akter",
                NID = "19851234567890123",    // 17 digits ✓
                Phone = "01812345678",
                Department = "Human Resources",
                BasicSalary = 72000,
                Spouse = new Spouse { Name = "Kamal Hossain", NID = "1984567890" },  // 10 digits
                Children = new List<Child>
                {
                    new() { Name = "Tanvir Hossain", DateOfBirth = new DateTime(2012, 11, 5, 0, 0, 0, DateTimeKind.Utc) }
                }
            },
            new()
            {
                Name = "Abdul Karim Chowdhury",
                NID = "1988765432",           // 10 digits
                Phone = "+8801912345678",
                Department = "Finance",
                BasicSalary = 95000,
                Spouse = new Spouse { Name = "Nasreen Sultana", NID = "19890123456789012" },  // 17 digits ✓
                Children = new List<Child>
                {
                    new() { Name = "Farhan Chowdhury", DateOfBirth = new DateTime(2010, 1, 20, 0, 0, 0, DateTimeKind.Utc) },
                    new() { Name = "Faria Chowdhury", DateOfBirth = new DateTime(2013, 6, 15, 0, 0, 0, DateTimeKind.Utc) },
                    new() { Name = "Fahim Chowdhury", DateOfBirth = new DateTime(2017, 9, 8, 0, 0, 0, DateTimeKind.Utc) }
                }
            },
            new()
            {
                Name = "Nusrat Jahan",
                NID = "1992345678",           // 10 digits
                Phone = "01612345678",
                Department = "Marketing",
                BasicSalary = 68000,
                Spouse = new Spouse { Name = "Jahangir Alam", NID = "1990987654" },  // 10 digits
                Children = new List<Child>
                {
                    new() { Name = "Raiyan Alam", DateOfBirth = new DateTime(2019, 4, 30, 0, 0, 0, DateTimeKind.Utc) }
                }
            },
            new()
            {
                Name = "Mohammad Shahin Mia",
                NID = "19871234567890123",    // 17 digits ✓
                Phone = "+8801512345678",
                Department = "IT Support",
                BasicSalary = 55000,
                Spouse = new Spouse { Name = "Ayesha Siddiqua", NID = "1989012345" },  // 10 digits
                Children = new List<Child>
                {
                    new() { Name = "Sakib Shahin", DateOfBirth = new DateTime(2016, 8, 14, 0, 0, 0, DateTimeKind.Utc) },
                    new() { Name = "Sadia Shahin", DateOfBirth = new DateTime(2020, 2, 28, 0, 0, 0, DateTimeKind.Utc) }
                }
            },
            new()
            {
                Name = "Shamima Nasrin",
                NID = "1993456789",           // 10 digits
                Phone = "01312345678",
                Department = "Engineering",
                BasicSalary = 78000,
                Spouse = new Spouse { Name = "Mizanur Rahman", NID = "19920123456789012" },  // 17 digits ✓
                Children = new List<Child>
                {
                    new() { Name = "Nabil Rahman", DateOfBirth = new DateTime(2017, 12, 3, 0, 0, 0, DateTimeKind.Utc) }
                }
            },
            new()
            {
                Name = "Rezaul Karim",
                NID = "1986543210",           // 10 digits
                Phone = "+8801412345678",
                Department = "Operations",
                BasicSalary = 62000,
                Spouse = new Spouse { Name = "Monira Begum", NID = "1988654321" },   // 10 digits
                Children = new List<Child>
                {
                    new() { Name = "Tasnim Karim", DateOfBirth = new DateTime(2011, 5, 18, 0, 0, 0, DateTimeKind.Utc) },
                    new() { Name = "Tahsin Karim", DateOfBirth = new DateTime(2014, 10, 7, 0, 0, 0, DateTimeKind.Utc) }
                }
            },
            new()
            {
                Name = "Sumaiya Rahman",
                NID = "19941234567890123",    // 17 digits ✓
                Phone = "01712345679",
                Department = "Finance",
                BasicSalary = 88000,
                Spouse = new Spouse { Name = "Shafiqul Islam", NID = "1993012345" }, // 10 digits
                Children = new List<Child>
                {
                    new() { Name = "Arham Islam", DateOfBirth = new DateTime(2021, 1, 15, 0, 0, 0, DateTimeKind.Utc) }
                }
            },
            new()
            {
                Name = "Faisal Ahmed",
                NID = "1987654321",           // 10 digits
                Phone = "+8801812345679",
                Department = "Sales",
                BasicSalary = 71000,
                Spouse = new Spouse { Name = "Ruma Akter", NID = "19891234567890123" },  // 17 digits ✓
                Children = new List<Child>
                {
                    new() { Name = "Adyan Ahmed", DateOfBirth = new DateTime(2013, 3, 22, 0, 0, 0, DateTimeKind.Utc) },
                    new() { Name = "Ayaan Ahmed", DateOfBirth = new DateTime(2016, 11, 9, 0, 0, 0, DateTimeKind.Utc) }
                }
            },
            new()
            {
                Name = "Mahmuda Khatun",
                NID = "1991012345",           // 10 digits
                Phone = "01912345679",
                Department = "Administration",
                BasicSalary = 65000,
                Spouse = new Spouse { Name = "Nurul Haque", NID = "1989876543" },    // 10 digits
                Children = new List<Child>
                {
                    new() { Name = "Faiyaz Haque", DateOfBirth = new DateTime(2015, 7, 1, 0, 0, 0, DateTimeKind.Utc) },
                    new() { Name = "Fariha Haque", DateOfBirth = new DateTime(2019, 9, 19, 0, 0, 0, DateTimeKind.Utc) }
                }
            }
        };

        context.Employees.AddRange(employees);
        await context.SaveChangesAsync();
    }
}
