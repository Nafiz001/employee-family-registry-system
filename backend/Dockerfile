FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and restoring dependencies first
COPY ["EmployeeRegistry.sln", "./"]
COPY ["EmployeeRegistry.Api/EmployeeRegistry.Api.csproj", "EmployeeRegistry.Api/"]
COPY ["EmployeeRegistry.Application/EmployeeRegistry.Application.csproj", "EmployeeRegistry.Application/"]
COPY ["EmployeeRegistry.Domain/EmployeeRegistry.Domain.csproj", "EmployeeRegistry.Domain/"]
COPY ["EmployeeRegistry.Infrastructure/EmployeeRegistry.Infrastructure.csproj", "EmployeeRegistry.Infrastructure/"]
COPY ["EmployeeRegistry.UnitTests/EmployeeRegistry.UnitTests.csproj", "EmployeeRegistry.UnitTests/"]
COPY ["EmployeeRegistry.IntegrationTests/EmployeeRegistry.IntegrationTests.csproj", "EmployeeRegistry.IntegrationTests/"]
RUN dotnet restore "EmployeeRegistry.sln"

# Copy the rest of the source code and build
COPY . .
WORKDIR "/src/EmployeeRegistry.Api"
RUN dotnet build "EmployeeRegistry.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "EmployeeRegistry.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "EmployeeRegistry.Api.dll"]
