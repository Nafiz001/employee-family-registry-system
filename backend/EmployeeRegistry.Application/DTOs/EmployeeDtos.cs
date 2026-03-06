namespace EmployeeRegistry.Application.DTOs;

public class EmployeeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NID { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public decimal BasicSalary { get; set; }
    public SpouseDto? Spouse { get; set; }
    public List<ChildDto> Children { get; set; } = new();
}

public class CreateEmployeeDto
{
    public string Name { get; set; } = string.Empty;
    public string NID { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public decimal BasicSalary { get; set; }
    public CreateSpouseDto? Spouse { get; set; }
    public List<CreateChildDto> Children { get; set; } = new();
}

public class UpdateEmployeeDto
{
    public string Name { get; set; } = string.Empty;
    public string NID { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public decimal BasicSalary { get; set; }
    public UpdateSpouseDto? Spouse { get; set; }
    public List<UpdateChildDto> Children { get; set; } = new();
}
