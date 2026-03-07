using EmployeeRegistry.Domain.Entities;

namespace EmployeeRegistry.Domain.Interfaces;

public interface IEmployeeRepository
{
    Task<IEnumerable<Employee>> GetAllAsync(string? search = null);
    Task<Employee?> GetByIdAsync(int id);
    Task<Employee> CreateAsync(Employee employee);
    Task<Employee> UpdateAsync(Employee employee);
    Task<bool> DeleteAsync(int id);
    Task<bool> NidExistsAsync(string nid, int? excludeId = null);
    Task<bool> NidExistsGloballyAsync(string nid, int? excludeEmployeeId = null);
}
