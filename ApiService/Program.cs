using System.Reflection;
using Data;
using ApiService.Services;
using OpenAI;

var builder = WebApplication.CreateBuilder(args);

// Add service defaults & Aspire client integrations.
builder.AddServiceDefaults();

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
});
builder.Services.AddProblemDetails();
builder.Services.AddCors();
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
});
builder.Services.AddEndpointsApiExplorer();

// Add OpenAI client
var openAIApiKey = builder.Configuration["OpenAI:ApiKey"];
var isTestingEnvironment = builder.Environment.IsEnvironment("Testing");

if (!string.IsNullOrEmpty(openAIApiKey) && !isTestingEnvironment)
{
    builder.Services.AddSingleton<OpenAIClient>(_ => new OpenAIClient(openAIApiKey));
    builder.Services.AddSingleton<SemanticExpenseCategorizer>();
    builder.Services.AddSingleton<ExpenseCategorizer>(provider =>
        new ExpenseCategorizer(provider.GetService<SemanticExpenseCategorizer>()));
}
else
{
    // Fallback to rule-based only categorization (for testing or when no API key is configured)
    builder.Services.AddSingleton<ExpenseCategorizer>();
}

// Add database context
builder.AddSqlServerDbContext<ExpenseDbContext>("expensedb");

builder.Services.AddOpenApiDocument(options =>
{
    options.DocumentName = "v1";
    options.Title = "Expense Tracker API";
    options.Version = "v1";
    options.UseHttpAttributeNameAsOperationId = true;
    
    options.PostProcess = document =>
    {
        document.BasePath = "/";
    };
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseExceptionHandler();
app.UseCors(static builder =>
{
    builder.AllowAnyOrigin()
           .AllowAnyMethod()
           .AllowAnyHeader()
           .WithExposedHeaders("*");
});
app.MapDefaultEndpoints();
app.MapControllers();
app.MapGet("/health", () => "Healthy");
app.UseOpenApi();
app.UseSwaggerUi();
app.Run();

// Make Program class accessible for integration tests
public partial class Program { }