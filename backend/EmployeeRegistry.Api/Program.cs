using System.Text;
using EmployeeRegistry.Api.Middleware;
using EmployeeRegistry.Application;
using EmployeeRegistry.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT support
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Employee Registry API",
        Version = "v1",
        Description = "API for managing employees and their family data"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is missing from configuration.");
var key = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

builder.Services.AddAuthorization();

// Register Application services (Services, Validators)
builder.Services.AddApplication();

// Register Infrastructure services (DbContext, Repositories)
builder.Services.AddInfrastructure(builder.Configuration);

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Add a simple health check or root endpoint to prevent 404s when visiting the raw Render URL
app.MapGet("/", () => "Employee Registry API is running smoothly!");

// Debug endpoint to manually trigger migrations and see errors
app.MapGet("/api/debug/migrate", async (EmployeeRegistry.Infrastructure.Data.ApplicationDbContext context) => 
{
    try 
    {
        await context.Database.MigrateAsync();
        await EmployeeRegistry.Infrastructure.Data.DataSeeder.SeedAsync(context);
        return Results.Ok("Migration and Seeding successful!");
    }
    catch (Exception ex)
    {
        return Results.InternalServerError(new { 
            Message = "Migration failed", 
            Error = ex.Message, 
            Inner = ex.InnerException?.Message,
            Stack = ex.StackTrace 
        });
    }
});

// Apply migrations and seed data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        logger.LogInformation("Starting database migration...");
        var context = services.GetRequiredService<EmployeeRegistry.Infrastructure.Data.ApplicationDbContext>();
        context.Database.Migrate();
        logger.LogInformation("Database migration completed. Starting seeding...");
        await EmployeeRegistry.Infrastructure.Data.DataSeeder.SeedAsync(context);
        logger.LogInformation("Database seeding completed successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred during database migration or seeding.");
    }
}

app.Run();
