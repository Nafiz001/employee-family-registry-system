using EmployeeRegistry.Application.DTOs;
using EmployeeRegistry.Domain.Interfaces;
using FluentValidation;

namespace EmployeeRegistry.Application.Validators;

public class CreateEmployeeValidator : AbstractValidator<CreateEmployeeDto>
{
    public CreateEmployeeValidator(IEmployeeRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(x => x.NID)
            .NotEmpty().WithMessage("NID is required.")
            .Matches(@"^(\d{10}|\d{17})$").WithMessage("NID must be exactly 10 or 17 digits.")
            .MustAsync(async (nid, cancellation) => !await repository.NidExistsGloballyAsync(nid))
            .WithMessage("This NID is already in use by an employee or spouse.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone is required.")
            .Matches(@"^(\+8801|01)[3-9]\d{8}$").WithMessage("Phone must be a valid Bangladesh number (+8801XXXXXXXXX or 01XXXXXXXXX).");

        RuleFor(x => x.Department)
            .NotEmpty().WithMessage("Department is required.")
            .MaximumLength(100).WithMessage("Department must not exceed 100 characters.");

        RuleFor(x => x.BasicSalary)
            .GreaterThanOrEqualTo(0).WithMessage("Basic salary must be non-negative.");

        When(x => x.Spouse != null, () =>
        {
            RuleFor(x => x.Spouse!.Name)
                .NotEmpty().WithMessage("Spouse name is required.");

            RuleFor(x => x.Spouse!.NID)
                .Matches(@"^(\d{10}|\d{17})$").WithMessage("Spouse NID must be exactly 10 or 17 digits.")
                .When(x => !string.IsNullOrEmpty(x.Spouse?.NID));
        });

        RuleForEach(x => x.Children).ChildRules(child =>
        {
            child.RuleFor(c => c.Name)
                .NotEmpty().WithMessage("Child name is required.");

            child.RuleFor(c => c.DateOfBirth)
                .LessThan(DateTime.UtcNow).WithMessage("Child date of birth must be in the past.");
        });
    }
}

public class UpdateEmployeeValidator : AbstractValidator<UpdateEmployeeDto>
{
    public UpdateEmployeeValidator(IEmployeeRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(x => x.NID)
            .NotEmpty().WithMessage("NID is required.")
            .Matches(@"^(\d{10}|\d{17})$").WithMessage("NID must be exactly 10 or 17 digits.")
            .MustAsync(async (dto, nid, cancellation) => !await repository.NidExistsGloballyAsync(nid, dto.Id))
            .WithMessage("This NID is already in use by an employee or spouse.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone is required.")
            .Matches(@"^(\+8801|01)[3-9]\d{8}$").WithMessage("Phone must be a valid Bangladesh number (+8801XXXXXXXXX or 01XXXXXXXXX).");

        RuleFor(x => x.Department)
            .NotEmpty().WithMessage("Department is required.")
            .MaximumLength(100).WithMessage("Department must not exceed 100 characters.");

        RuleFor(x => x.BasicSalary)
            .GreaterThanOrEqualTo(0).WithMessage("Basic salary must be non-negative.");

        When(x => x.Spouse != null, () =>
        {
            RuleFor(x => x.Spouse!.Name)
                .NotEmpty().WithMessage("Spouse name is required.");

            RuleFor(x => x.Spouse!.NID)
                .Matches(@"^(\d{10}|\d{17})$").WithMessage("Spouse NID must be exactly 10 or 17 digits.")
                .MustAsync(async (dto, nid, cancellation) => !await repository.NidExistsGloballyAsync(nid, dto.Id))
                .WithMessage("This NID is already in use by an employee or spouse.")
                .When(x => !string.IsNullOrEmpty(x.Spouse?.NID));
        });

        RuleForEach(x => x.Children).ChildRules(child =>
        {
            child.RuleFor(c => c.Name)
                .NotEmpty().WithMessage("Child name is required.");

            child.RuleFor(c => c.DateOfBirth)
                .LessThan(DateTime.UtcNow).WithMessage("Child date of birth must be in the past.");
        });
    }
}
