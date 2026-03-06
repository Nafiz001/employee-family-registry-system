using EmployeeRegistry.Application.DTOs;
using EmployeeRegistry.Domain.Entities;
using EmployeeRegistry.Domain.Interfaces;

namespace EmployeeRegistry.Application.Services;

public interface IEmployeeService
{
    Task<IEnumerable<EmployeeDto>> GetAllAsync(string? search = null);
    Task<EmployeeDto?> GetByIdAsync(int id);
    Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto);
    Task<EmployeeDto?> UpdateAsync(int id, UpdateEmployeeDto dto);
    Task<bool> DeleteAsync(int id);
}

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _repository;

    public EmployeeService(IEmployeeRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<EmployeeDto>> GetAllAsync(string? search = null)
    {
        var employees = await _repository.GetAllAsync(search);
        return employees.Select(MapToDto);
    }

    public async Task<EmployeeDto?> GetByIdAsync(int id)
    {
        var employee = await _repository.GetByIdAsync(id);
        return employee == null ? null : MapToDto(employee);
    }

    public async Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto)
    {
        var employee = new Employee
        {
            Name = dto.Name,
            NID = dto.NID,
            Phone = dto.Phone,
            Department = dto.Department,
            BasicSalary = dto.BasicSalary,
            Spouse = dto.Spouse != null ? new Spouse
            {
                Name = dto.Spouse.Name,
                NID = dto.Spouse.NID
            } : null,
            Children = dto.Children.Select(c => new Child
            {
                Name = c.Name,
                DateOfBirth = c.DateOfBirth
            }).ToList()
        };

        var created = await _repository.CreateAsync(employee);
        return MapToDto(created);
    }

    public async Task<EmployeeDto?> UpdateAsync(int id, UpdateEmployeeDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return null;

        existing.Name = dto.Name;
        existing.NID = dto.NID;
        existing.Phone = dto.Phone;
        existing.Department = dto.Department;
        existing.BasicSalary = dto.BasicSalary;

        // Update Spouse
        if (dto.Spouse != null)
        {
            if (existing.Spouse != null)
            {
                existing.Spouse.Name = dto.Spouse.Name;
                existing.Spouse.NID = dto.Spouse.NID;
            }
            else
            {
                existing.Spouse = new Spouse
                {
                    Name = dto.Spouse.Name,
                    NID = dto.Spouse.NID
                };
            }
        }
        else
        {
            existing.Spouse = null;
        }

        // Update Children
        existing.Children.Clear();
        foreach (var childDto in dto.Children)
        {
            existing.Children.Add(new Child
            {
                Name = childDto.Name,
                DateOfBirth = childDto.DateOfBirth
            });
        }

        var updated = await _repository.UpdateAsync(existing);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }

    private static EmployeeDto MapToDto(Employee employee)
    {
        return new EmployeeDto
        {
            Id = employee.Id,
            Name = employee.Name,
            NID = employee.NID,
            Phone = employee.Phone,
            Department = employee.Department,
            BasicSalary = employee.BasicSalary,
            Spouse = employee.Spouse != null ? new SpouseDto
            {
                Id = employee.Spouse.Id,
                Name = employee.Spouse.Name,
                NID = employee.Spouse.NID
            } : null,
            Children = employee.Children.Select(c => new ChildDto
            {
                Id = c.Id,
                Name = c.Name,
                DateOfBirth = c.DateOfBirth
            }).ToList()
        };
    }
}
