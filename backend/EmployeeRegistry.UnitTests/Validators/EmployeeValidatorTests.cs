using EmployeeRegistry.Application.DTOs;
using EmployeeRegistry.Application.Validators;
using EmployeeRegistry.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace EmployeeRegistry.UnitTests.Validators;

public class EmployeeValidatorTests
{
    private readonly Mock<IEmployeeRepository> _repositoryMock;
    private readonly CreateEmployeeValidator _validator;

    public EmployeeValidatorTests()
    {
        _repositoryMock = new Mock<IEmployeeRepository>();
        _validator = new CreateEmployeeValidator(_repositoryMock.Object);
    }

    [Theory]
    [InlineData("1234567890")] // 10 digits
    [InlineData("12345678901234567")] // 17 digits
    public async Task NID_ShouldBeValid_WhenLengthIs10Or17(string nid)
    {
        // Arrange
        var dto = new CreateEmployeeDto { NID = nid, Name = "Test", Phone = "01712345678", Department = "IT", BasicSalary = 1000 };
        _repositoryMock.Setup(x => x.NidExistsAsync(nid, null)).ReturnsAsync(false);

        // Act
        var result = await _validator.ValidateAsync(dto);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("12345")] // Too short
    [InlineData("12345678901")] // 11 digits
    [InlineData("abc1234567")] // Non-digits
    public async Task NID_ShouldBeInvalid_WhenFormatIsIncorrect(string nid)
    {
        // Arrange
        var dto = new CreateEmployeeDto { NID = nid, Name = "Test", Phone = "01712345678", Department = "IT", BasicSalary = 1000 };

        // Act
        var result = await _validator.ValidateAsync(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(x => x.PropertyName == "NID" && x.ErrorMessage == "NID must be exactly 10 or 17 digits.");
    }

    [Theory]
    [InlineData("01712345678")]
    [InlineData("+8801712345678")]
    [InlineData("01912345678")]
    public async Task Phone_ShouldBeValid_WhenFormatIsBangladeshi(string phone)
    {
        // Arrange
        var dto = new CreateEmployeeDto { NID = "1234567890", Name = "Test", Phone = phone, Department = "IT", BasicSalary = 1000 };
        _repositoryMock.Setup(x => x.NidExistsAsync(dto.NID, null)).ReturnsAsync(false);

        // Act
        var result = await _validator.ValidateAsync(dto);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("1234567890")] // No 01 prefix
    [InlineData("01212345678")] // Invalid prefix 012
    [InlineData("0171234567")] // Too short
    public async Task Phone_ShouldBeInvalid_WhenFormatIsIncorrect(string phone)
    {
        // Arrange
        var dto = new CreateEmployeeDto { NID = "1234567890", Name = "Test", Phone = phone, Department = "IT", BasicSalary = 1000 };

        // Act
        var result = await _validator.ValidateAsync(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(x => x.PropertyName == "Phone");
    }
}
