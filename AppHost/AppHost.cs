var builder = DistributedApplication.CreateBuilder(args);

// SQL Server - database services don't need health checks
var sqlServer = builder
    .AddSqlServer("expense-sqlserver", port: 9000)
    .WithLifetime(ContainerLifetime.Persistent)
    .AddDatabase("expensedb");

// Migration service - runs once to set up database, then exits
var migrationService = builder.AddProject<Projects.MigrationService>("migrationservice")
    .WithReference(sqlServer)
    .WaitFor(sqlServer);

// API service with health check
var apiService = builder.AddProject<Projects.ApiService>("apiservice")
    .WithReference(sqlServer)
    .WaitFor(sqlServer)
    .WaitFor(migrationService)
    .WithHttpHealthCheck("/health");

// Web application - marked as default to open in browser
builder.AddNpmApp("web", "../web", "dev")
    .WithReference(apiService)
    .WithHttpEndpoint(3000, env: "PORT")
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();

var app = builder.Build();

app.Run();
