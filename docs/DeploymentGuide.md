# Cloud Deployment Guide

This guide walks you through deploying the **Employee & Family Registry System** across modern, free-tier friendly cloud hosting providers.

## Architecture Map
* **Database**: Supabase (PostgreSQL)
* **Backend API**: Render (ASP.NET Core 8 Web API via Docker)
* **Frontend**: Vercel (React 19 / Vite SPA)

---

## 1. Database Deployment (Supabase)
Supabase provides a powerful managed PostgreSQL database.

1. Go to [Supabase](https://supabase.com/) and create a new account/project.
2. In your new Project, navigate to **Project Settings -> Database**.
3. Locate the **Connection String** (URI format) which will look something like:
   `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`
4. Save this connection string securely. Replace `[password]` with the actual password you set during project creation.

**Note on Migrations**:
When the backend successfully deploys to Render and boots up for the first time, our `Program.cs` logic will automatically run `context.Database.MigrateAsync()` and execute the `DataSeeder.cs`, creating all your tables and demo users in Supabase instantly.

---

## 2. Backend API Deployment (Render)
Render offers native Docker support which makes deploying our .NET 8 backend trivial since we already wrote the `Dockerfile`.

1. Push your latest code to a GitHub repository.
2. Go to [Render](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Fill in the following settings:
   * **Name**: `employee-registry-api` (or similar)
   * **Root Directory**: `backend` *(Important: Point this specifically to the backend folder)*
   * **Environment**: `Docker`
   * **Instance Type**: Free
5. **Environment Variables**: Add the following critical keys:
   * `ASPNETCORE_ENVIRONMENT` = `Production`
   * `ConnectionStrings__DefaultConnection` = *(Paste your Supabase Connection String here)*
   * `JwtSettings__Secret` = *(Create a random 32+ character string securely)*
   * `JwtSettings__Issuer` = `EmployeeRegistryClient`
   * `JwtSettings__Audience` = `EmployeeRegistryApi`
6. Click **Create Web Service**. 
7. Render will build the Docker container and deploy it. Once live, copy your Render URL (e.g., `https://employee-registry-api-xyz.onrender.com`).

> **Important Render Note**: Render's free tier spins down after 15 minutes of inactivity. When a user first loads the frontend, the API may take ~50 seconds to "wake up" and respond.

---

## 3. Frontend Deployment (Vercel)
Vercel is aggressively optimized for Vite/React applications.

1. Go to [Vercel](https://vercel.com/) and select **Add New Project**.
2. Connect your GitHub repository.
3. Configure the Project:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend/employee-registry-ui` *(Click Edit and ensure it points here)*
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. **Environment Variables**: Add the backend URL so the frontend knows where to fetch data from:
   * `VITE_API_URL` = `https://employee-registry-api-xyz.onrender.com/api` *(Paste your Render URL here, ensuring `/api` is at the end)*
5. Click **Deploy**. Vercel will build the frontend and provide you with a live, global edge URL.

### 3.1. Fixing React Router on Vercel
Because React uses Single Page Application routing, Vercel needs to know to rewrite all paths back to `index.html`. 

We need to create a `vercel.json` in your frontend directory before pushing to GitHub:

1. Inside `frontend/employee-registry-ui`, create a file named `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
2. Commit and push this file: `git add . && git commit -m "chore: add vercel.json for SPA routing"`
3. Vercel will automatically redeploy and React Router (like browsing to `/employees/new` directly from the URL bar) will work perfectly.

---

## 4. Verification
1. Open your Vercel frontend URL.
2. Use the seeded credentials (`admin` / `Admin@123`) to log in.
3. The frontend will successfully authenticate against the Render backend, retrieving data cleanly from Supabase!
