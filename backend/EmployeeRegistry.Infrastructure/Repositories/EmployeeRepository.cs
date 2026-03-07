using EmployeeRegistry.Domain.Entities;
using EmployeeRegistry.Domain.Interfaces;
using EmployeeRegistry.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EmployeeRegistry.Infrastructure.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly ApplicationDbContext _context;

    public EmployeeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Employee>> GetAllAsync(string? search = null)
    {
        var query = _context.Employees
            .Include(e => e.Spouse)
            .Include(e => e.Children)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(e =>
                e.Name.ToLower().Contains(searchLower) ||
                e.NID.Contains(search) ||
                e.Department.ToLower().Contains(searchLower));
        }

        return await query.OrderBy(e => e.Id).ToListAsync();
    }

    public async Task<Employee?> GetByIdAsync(int id)
    {
        return await _context.Employees
            .Include(e => e.Spouse)
            .Include(e => e.Children)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<Employee> CreateAsync(Employee employee)
    {
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();
        return employee;
    }

    public async Task<Employee> UpdateAsync(Employee employee)
    {
        // Remove orphaned children that were cleared from the collection by the service layer.
        // EF Core tracks all loaded Children; any that are no longer in the collection need
        // to be explicitly deleted because the FK is non-nullable (cascade orphan removal).
        var orphanedChildren = _context.Children
            .Local
            .Where(c => c.EmployeeId == employee.Id && !employee.Children.Contains(c))
            .ToList();
        _context.Children.RemoveRange(orphanedChildren);

        // Remove orphaned spouse if it was set to null by the service layer.
        var orphanedSpouse = _context.Spouses
            .Local
            .FirstOrDefault(s => s.EmployeeId == employee.Id && employee.Spouse == null);
        if (orphanedSpouse != null)
            _context.Spouses.Remove(orphanedSpouse);

        await _context.SaveChangesAsync();
        return employee;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return false;

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> NidExistsAsync(string nid, int? excludeId = null)
    {
        var query = _context.Employees.Where(e => e.NID == nid);
        if (excludeId.HasValue)
            query = query.Where(e => e.Id != excludeId.Value);

        return await query.AnyAsync();
    }

    public async Task<bool> NidExistsGloballyAsync(string nid, int? excludeEmployeeId = null)
    {
        // Check Employees table (excluding the employee being updated)
        var employeeQuery = _context.Employees.Where(e => e.NID == nid);
        if (excludeEmployeeId.HasValue)
            employeeQuery = employeeQuery.Where(e => e.Id != excludeEmployeeId.Value);

        if (await employeeQuery.AnyAsync()) return true;

        // Check Spouses table (excluding the spouse belonging to the employee being updated)
        var spouseQuery = _context.Spouses.Where(s => s.NID == nid);
        if (excludeEmployeeId.HasValue)
            spouseQuery = spouseQuery.Where(s => s.EmployeeId != excludeEmployeeId.Value);

        return await spouseQuery.AnyAsync();
    }
}
