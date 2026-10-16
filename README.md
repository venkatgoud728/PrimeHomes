# PrimeHomes

PrimeHomes is a real estate application organized as a monorepo:

```text
frontend/                 Angular application
backend/
  PrimeHomes.API/         ASP.NET Core Web API
  PrimeHomes.API.slnx     .NET solution
.editorconfig             Shared editor settings
.gitignore                Repository ignore rules
```

## Frontend

Requirements: Node.js and npm.

From the repository root:

```powershell
cd frontend
npm ci
npm start
```

The Angular development server uses `http://localhost:4200`.

Build the frontend:

```powershell
npm run build
```

Run the frontend unit tests:

```powershell
npm test -- --watch=false
```

Some existing frontend specs currently fail to compile because they import
service/model symbols that are not exported by the referenced modules. These
are test-source errors rather than path/configuration errors from the folder
move; no test source was modified.

## Backend

Requirements: .NET SDK 8 and a SQL Server instance.

The default connection string is in `backend/PrimeHomes.API/appsettings.json` and
uses Windows trusted authentication against a local SQL Server. Override
`ConnectionStrings__DefaultConnection` in the environment when using a different
connection string. Apply the existing Entity Framework Core migrations to the
database before using the API.

From the repository root, restore and build the solution:

```powershell
dotnet restore .\backend\PrimeHomes.API.slnx
dotnet build .\backend\PrimeHomes.API.slnx --no-restore
```

JWT signing requires a secret of at least 32 bytes. Set it in the environment;
do not commit the secret or place it in tracked configuration files:

```powershell
$env:Jwt__SigningKey = "<provide-a-secret-at-least-32-bytes-long>"
dotnet run --project .\backend\PrimeHomes.API\PrimeHomes.API.csproj --launch-profile http
```

The existing HTTP launch profile uses `http://localhost:5085`. The HTTPS profile
uses `https://localhost:7299` and `http://localhost:5085`. Swagger is enabled in
the Development environment.

There is currently no backend test project in the solution. Add one before
expecting `dotnet test` to execute API tests.

## Configuration

The API retains its SQL Server connection-string configuration, JWT bearer
authentication, CORS policy for the Angular development origin, Swagger setup,
launch profiles, and existing endpoints. The Angular app continues to use its
existing API URLs and development port.
