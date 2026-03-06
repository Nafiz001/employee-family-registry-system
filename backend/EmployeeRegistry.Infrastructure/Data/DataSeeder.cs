using EmployeeRegistry.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EmployeeRegistry.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.Employees.AnyAsync())
            return;

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
        }

        var employees = new List<Employee>
        {
            new()
            {
                Name = "Md. Rafiqul Islam",
                NID = "1990123456789",
                Phone = "+8801712345678",
                Department = "Engineering",
                BasicSalary = 85000,
                Spouse = new Spouse { Name = "Fatema Begum", NID = "1991234567890" },
                Children = new List<Child>
                {
                    new() { Name = "Ahnaf Islam", DateOfBirth = new DateTime(2015, 3, 12) },
                    new() { Name = "Anika Islam", DateOfBirth = new DateTime(2018, 7, 25) }
                }
            },
            new()
            {
                Name = "Taslima Akter",
                NID = "19851234567890123",
                Phone = "01812345678",
                Department = "Human Resources",
                BasicSalary = 72000,
                Spouse = new Spouse { Name = "Kamal Hossain", NID = "1984567890123" },
                Children = new List<Child>
                {
                    new() { Name = "Tanvir Hossain", DateOfBirth = new DateTime(2012, 11, 5) }
                }
            },
            new()
            {
                Name = "Abdul Karim Chowdhury",
                NID = "1988765432101",
                Phone = "+8801912345678",
                Department = "Finance",
                BasicSalary = 95000,
                Spouse = new Spouse { Name = "Nasreen Sultana", NID = "19890123456789012" },
                Children = new List<Child>
                {
                    new() { Name = "Farhan Chowdhury", DateOfBirth = new DateTime(2010, 1, 20) },
                    new() { Name = "Faria Chowdhury", DateOfBirth = new DateTime(2013, 6, 15) },
                    new() { Name = "Fahim Chowdhury", DateOfBirth = new DateTime(2017, 9, 8) }
                }
            },
            new()
            {
                Name = "Nusrat Jahan",
                NID = "1992345678901",
                Phone = "01612345678",
                Department = "Marketing",
                BasicSalary = 68000,
                Spouse = new Spouse { Name = "Jahangir Alam", NID = "1990987654321" },
                Children = new List<Child>
                {
                    new() { Name = "Raiyan Alam", DateOfBirth = new DateTime(2019, 4, 30) }
                }
            },
            new()
            {
                Name = "Mohammad Shahin Mia",
                NID = "19871234567890123",
                Phone = "+8801512345678",
                Department = "IT Support",
                BasicSalary = 55000,
                Spouse = new Spouse { Name = "Ayesha Siddiqua", NID = "1989012345678" },
                Children = new List<Child>
                {
                    new() { Name = "Sakib Shahin", DateOfBirth = new DateTime(2016, 8, 14) },
                    new() { Name = "Sadia Shahin", DateOfBirth = new DateTime(2020, 2, 28) }
                }
            },
            new()
            {
                Name = "Shamima Nasrin",
                NID = "1993456789012",
                Phone = "01312345678",
                Department = "Engineering",
                BasicSalary = 78000,
                Spouse = new Spouse { Name = "Mizanur Rahman", NID = "19920123456789012" },
                Children = new List<Child>
                {
                    new() { Name = "Nabil Rahman", DateOfBirth = new DateTime(2017, 12, 3) }
                }
            },
            new()
            {
                Name = "Rezaul Karim",
                NID = "1986543210987",
                Phone = "+8801412345678",
                Department = "Operations",
                BasicSalary = 62000,
                Spouse = new Spouse { Name = "Monira Begum", NID = "1988654321098" },
                Children = new List<Child>
                {
                    new() { Name = "Tasnim Karim", DateOfBirth = new DateTime(2011, 5, 18) },
                    new() { Name = "Tahsin Karim", DateOfBirth = new DateTime(2014, 10, 7) }
                }
            },
            new()
            {
                Name = "Sumaiya Rahman",
                NID = "19941234567890123",
                Phone = "01712345679",
                Department = "Finance",
                BasicSalary = 88000,
                Spouse = new Spouse { Name = "Shafiqul Islam", NID = "1993012345678" },
                Children = new List<Child>
                {
                    new() { Name = "Arham Islam", DateOfBirth = new DateTime(2021, 1, 15) }
                }
            },
            new()
            {
                Name = "Faisal Ahmed",
                NID = "1987654321012",
                Phone = "+8801812345679",
                Department = "Sales",
                BasicSalary = 71000,
                Spouse = new Spouse { Name = "Ruma Akter", NID = "19891234567890123" },
                Children = new List<Child>
                {
                    new() { Name = "Adyan Ahmed", DateOfBirth = new DateTime(2013, 3, 22) },
                    new() { Name = "Ayaan Ahmed", DateOfBirth = new DateTime(2016, 11, 9) }
                }
            },
            new()
            {
                Name = "Mahmuda Khatun",
                NID = "1991012345678",
                Phone = "01912345679",
                Department = "Administration",
                BasicSalary = 65000,
                Spouse = new Spouse { Name = "Nurul Haque", NID = "1989876543210" },
                Children = new List<Child>
                {
                    new() { Name = "Faiyaz Haque", DateOfBirth = new DateTime(2015, 7, 1) },
                    new() { Name = "Fariha Haque", DateOfBirth = new DateTime(2019, 9, 19) }
                }
            }
        };

        context.Employees.AddRange(employees);
        await context.SaveChangesAsync();
    }
}
