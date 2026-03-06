using EmployeeRegistry.Application.DTOs;
using EmployeeRegistry.Application.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeRegistry.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;
    private readonly IValidator<CreateEmployeeDto> _createValidator;
    private readonly IValidator<UpdateEmployeeDto> _updateValidator;

    public EmployeesController(
        IEmployeeService employeeService,
        IValidator<CreateEmployeeDto> createValidator,
        IValidator<UpdateEmployeeDto> updateValidator)
    {
        _employeeService = employeeService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    /// <summary>
    /// Get all employees with optional search filter
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetAll([FromQuery] string? search = null)
    {
        var employees = await _employeeService.GetAllAsync(search);
        return Ok(employees);
    }

    /// <summary>
    /// Get a specific employee by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<EmployeeDto>> GetById(int id)
    {
        var employee = await _employeeService.GetByIdAsync(id);
        if (employee == null)
            return NotFound(new { Message = $"Employee with ID {id} not found." });

        return Ok(employee);
    }

    /// <summary>
    /// Create a new employee with optional spouse and children
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EmployeeDto>> Create([FromBody] CreateEmployeeDto dto)
    {
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                Message = "Validation failed.",
                Errors = validationResult.Errors.Select(e => new
                {
                    Field = e.PropertyName,
                    Error = e.ErrorMessage
                })
            });
        }

        var created = await _employeeService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Update an existing employee
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EmployeeDto>> Update(int id, [FromBody] UpdateEmployeeDto dto)
    {
        var validationResult = await _updateValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                Message = "Validation failed.",
                Errors = validationResult.Errors.Select(e => new
                {
                    Field = e.PropertyName,
                    Error = e.ErrorMessage
                })
            });
        }

        var updated = await _employeeService.UpdateAsync(id, dto);
        if (updated == null)
            return NotFound(new { Message = $"Employee with ID {id} not found." });

        return Ok(updated);
    }

    /// <summary>
    /// Delete an employee
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _employeeService.DeleteAsync(id);
        if (!result)
            return NotFound(new { Message = $"Employee with ID {id} not found." });

        return NoContent();
    }
}
