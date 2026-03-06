using EmployeeRegistry.Application.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace EmployeeRegistry.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        return services;
    }
}
