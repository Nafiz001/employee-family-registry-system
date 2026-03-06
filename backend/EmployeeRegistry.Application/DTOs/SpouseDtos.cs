namespace EmployeeRegistry.Application.DTOs;

public class SpouseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NID { get; set; } = string.Empty;
}

public class CreateSpouseDto
{
    public string Name { get; set; } = string.Empty;
    public string NID { get; set; } = string.Empty;
}

public class UpdateSpouseDto
{
    public int? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NID { get; set; } = string.Empty;
}
