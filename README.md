# Queue Management System

A modern queue management system designed to improve customer experience by reducing wait times and optimizing service flow.

## 🚀 Features
- Real-time queue tracking
- Queue booking and management
- User authentication & role management
- Shop / service configuration
- Queue history and reporting
- Responsive UI (Desktop & Mobile)

## 🛠 Tech Stack
- Backend: .NET (C#)
- Frontend: Next.js (React)
- Database: SQL Server
- Architecture: Clean Architecture

## ⚙️ Getting Started
1. Clone this repository
2. Setup database and run migrations
3. Configure environment variables
4. Run backend and frontend

## Production deployment

1. Provision SQL Server and create an empty database.
2. Set the API environment variables from `Api/.env.example` (use the server's
   secret manager; do not copy `.env` into source control).
3. Apply the EF migrations from the repository root:

   ```powershell
   dotnet ef database update --project Infrastructure/Queue.Infrastructure.csproj --startup-project Api/Queue.Api.csproj
   ```

   The initial migration includes the Thai address seed data. Keep the
   `Api/SeedData` directory available when applying migrations.
4. Publish and run the API:

   ```powershell
   dotnet publish Api/Queue.Api.csproj --configuration Release --output ./publish/api
   ```

5. Set `Frontend/.env.production` from `Frontend/.env.example`, install with
   `pnpm install --frozen-lockfile`, then build and start Next.js:

   ```powershell
   pnpm run build
   pnpm start
   ```

Only source, migrations, seed files, and public assets are required for a new
server. Build outputs, caches, `node_modules`, and runtime uploads are generated
outside source control.

## 🔒 Security Warning & Local Development
Do **NOT** store sensitive information such as Database Connection Strings, JWT Secret Keys, or Email Credentials directly in the `appsettings.json` or source code repository. 
Instead, please use [dotnet user-secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) for local development or Environment Variables in your production environment. 


## 🎯 Goals
- Reduce waiting time
- Improve service efficiency
- Provide scalable architecture for future expansion

## 🔮 Future Plans
- Real-time notifications (LINE / Email)
- Analytics dashboard
- Multi-branch support
- Queue prediction system

## Work continuation

If this task is continued by Antigravity or another coding agent, start with
[`ANTIGRAVITY_HANDOFF.md`](./ANTIGRAVITY_HANDOFF.md). It records the current
frontend design rules, completed work, remaining scope, and verification commands.
