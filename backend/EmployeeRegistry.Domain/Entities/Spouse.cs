namespace EmployeeRegistry.Domain.Entities;

public class Spouse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NID { get; set; } = string.Empty;

    // Foreign key
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
}
