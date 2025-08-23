var builder = DistributedApplication.CreateBuilder(args);

var sqlPassword = builder.AddParameter("sql-password", secret: true);

var sqlServer = builder
        .AddSqlServer("todo-sqlserver", password: sqlPassword, port: 9000)
        .WithLifetime(ContainerLifetime.Persistent)
        .AddDatabase("tododb");

var migrationService = builder.AddProject<Projects.MigrationService>("migrationservice")
    .WithReference(sqlServer)
    .WaitFor(sqlServer);

var apiService = builder.AddProject<Projects.ApiService>("apiservice")
    .WithReference(sqlServer)
    .WaitFor(sqlServer)
    .WaitFor(migrationService)
    .WithHttpHealthCheck("/health");

// The Python API is experimental and subject to change
#pragma warning disable ASPIREHOSTINGPYTHON001
var pythonApi = builder.AddPythonApp("pythonapi","../PythonApi","run_app.py")
    .WithHttpEndpoint(port: 8000, env: "PORT")
    .WithExternalHttpEndpoints();
#pragma warning restore ASPIREHOSTINGPYTHON001

builder.AddNpmApp("web", "../web", "dev")
    .WithReference(apiService)
    .WithReference(pythonApi)
    .WithHttpEndpoint(3000, env: "PORT")
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();

builder.Build().Run();
