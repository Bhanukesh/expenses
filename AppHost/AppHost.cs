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

// Python API with health check  
#pragma warning disable ASPIREHOSTINGPYTHON001
var pythonApi = builder.AddPythonApp("pythonapi", "../PythonApi", "run_app.py")
    .WithHttpEndpoint(port: 8000, env: "PORT")
    .WithHttpHealthCheck("/health")
    .WithExternalHttpEndpoints()
    .WithEnvironment("HOST", "127.0.0.1");
#pragma warning restore ASPIREHOSTINGPYTHON001

// Web application - marked as default to open in browser
builder.AddNpmApp("web", "../web", "dev")
    .WithReference(apiService)
    .WithReference(pythonApi)
    .WithHttpEndpoint(3000, env: "PORT")
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();

var app = builder.Build();

app.Run();
