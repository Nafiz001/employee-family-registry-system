using EmployeeRegistry.Domain.Entities;

namespace EmployeeRegistry.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User> CreateAsync(User user);
    Task<bool> UsernameExistsAsync(string username);
}
