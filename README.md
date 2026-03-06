# Employee & Family Registry System

A production-quality full-stack application for managing employee and family details efficiently.

## Features

- **Decoupled Architecture**: .NET 8 Web API backend + React 19 (TypeScript/Vite) frontend.
- **Relational Database**: PostgreSQL supported via Entity Framework Core.
- **Authentication**: JWT authentication with BCrypt password hashing.
- **Role-Based Access Control**: `Admin` (Full CRUD) vs `Viewer` (Read-only).
- **Advanced Validation**: FluentValidation for correct Bangladeshi NID formats (10 or 17 digits) and Phone formats.
- **Optimized Searching**: 400ms debounced queries against Name, NID, and Department using backend case-insensitive matching.
- **Reporting**: Export the current Employee List view to PDF, or export a detailed CV of a specific employee (including spouse and children's dates of births).
- **Responsive UI**: Tailwind CSS styled components.

## Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- [Node.js (LTS Version)](https://nodejs.org/)
- [PostgreSQL Server](https://www.postgresql.org/)

### Backend Setup
1. Open the project folder in terminal.
2. Update the `ConnectionStrings:DefaultConnection` correctly in `backend/EmployeeRegistry.Api/appsettings.json` with your real PostgreSQL credentials.
3. Apply standard EF migrations (or the app will automatically try to create and seed them upon normal startup).
   ```bash
   dotnet build backend/EmployeeRegistry.sln
   dotnet run --project backend/EmployeeRegistry.Api
   ```
4. The Swagger API definitions will be available locally (usually `https://localhost:7196/swagger`).
5. **Database Seeding**: The app boots up and seeds 10 realistic employees. It also creates two default users:
   - Admin Login: `admin` / `Admin@123`
   - Viewer Login: `viewer` / `Viewer@123`

### Frontend Setup
1. Open a new terminal instance and navigate to the frontend folder:
   ```bash
   cd frontend/employee-registry-ui
   ```
2. Install dependencies (Legacy peer deps used ensuring Tailwind v3 / PostCSS plugin compatibility with React 19 packages):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
### Docker Setup (Easiest)
You can build and run the entire application stack in a single command using Docker Compose:
1. Ensure Docker Desktop is installed and running.
2. Open a terminal in the root project folder containing `docker-compose.yml`.
3. Run the following command:
   ```bash
   docker-compose up --build
   ```
4. Access the applications:
   - **Frontend UI**: `http://localhost:3000`
   - **Backend API**: `http://localhost:8080/api` (Swagger at `http://localhost:8080/swagger`)
   - **PostgreSQL**: `localhost:5432`

---

## Architectural Notes
- The backend strictly enforces structural layers: **Domain** (Core rules/Entities) -> **Application** (DTOs, Validation, Interfaces, Business Logic) -> **Infrastructure** (Implementation of Repositories, DbContext) -> **Api** (Controllers, Middleware).
- **Global Error Handling**: Uncaught exceptions are globally handled natively by middleware to return a sanitized, consistent JSON response model across API ends avoiding leaky stacktraces.
- **React Frontend**: State mapping is driven contextually (`AuthContext`). We use `react-hook-form` connected to `yup` for high performance frontend validation bridging cleanly with the backend `FluentValidation` requirements.

Refer to `docs/SRS.md` for the Entity-Relationship (ER) diagram and precise technical limitations.
