using EmployeeRegistry.Domain.Interfaces;
using EmployeeRegistry.Infrastructure.Data;
using EmployeeRegistry.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EmployeeRegistry.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("Database connection string 'DefaultConnection' is missing.");

        // Safeguard: Remove any literal quotes that might be passed from some environment variable managers
        connectionString = connectionString.Trim('\"', ' ');

        // If it starts with postgres:// or postgresql://, convert URI to standard ADO.NET connection string
        if (connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) || 
            connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var uri = new Uri(connectionString);
                var userInfo = uri.UserInfo.Split(':');
                var username = userInfo[0];
                var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
                var host = uri.Host;
                var port = uri.Port > 0 ? uri.Port : 5432;
                var database = uri.LocalPath.TrimStart('/');

                var builder = new Npgsql.NpgsqlConnectionStringBuilder
                {
                    Host = host,
                    Port = port,
                    Username = username,
                    Password = password,
                    Database = database,
                    SslMode = Npgsql.SslMode.Require,
                    TrustServerCertificate = true,
                    // Connection timeouts for better reliability
                    Timeout = 30,
                    CommandTimeout = 300, // 5 minutes for migrations
                    // Pool settings for better production resilience
                    Pooling = true,
                    KeepAlive = 30
                };

                // Carry over any existing query parameters from the URI (like pgbouncer=true)
                if (!string.IsNullOrEmpty(uri.Query))
                {
                    // Manual query parsing to avoid System.Web dependency
                    var query = uri.Query.TrimStart('?');
                    var pairs = query.Split('&', StringSplitOptions.RemoveEmptyEntries);
                    foreach (var pair in pairs)
                    {
                        var parts = pair.Split('=');
                        if (parts.Length != 2) continue;
                        
                        var key = parts[0];
                        var val = Uri.UnescapeDataString(parts[1]);
                        
                        if (string.IsNullOrWhiteSpace(key)) continue;
                        if (key.Equals("sslmode", StringComparison.OrdinalIgnoreCase)) continue;
                        
                        builder[key] = val;
                    }
                }

                connectionString = builder.ToString();
            }
            catch (Exception ex)
            {
                // Fallback to original string if URI parsing fails, but log it
                Console.WriteLine($"Warning: Failed to parse connection string as URI: {ex.Message}");
            }
        }
        else if (!connectionString.Contains("Host=localhost", StringComparison.OrdinalIgnoreCase))
        {
            // For standard Key-Value strings, ensure SSL is active for cloud
            if (!connectionString.Contains("SSL Mode=", StringComparison.OrdinalIgnoreCase))
            {
                connectionString += ";SSL Mode=Require;Trust Server Certificate=true";
            }
        }

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString, npgsqlOptions => 
            {
                npgsqlOptions.CommandTimeout(300); // 5 minutes for EF Core operations
                npgsqlOptions.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
            }));

        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<IUserRepository, UserRepository>();

        return services;
    }
}
