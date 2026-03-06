namespace EmployeeRegistry.Application.DTOs;

public class ChildDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
}

public class CreateChildDto
{
    public string Name { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
}

public class UpdateChildDto
{
    public int? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
}
