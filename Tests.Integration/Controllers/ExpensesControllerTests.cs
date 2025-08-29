using System.Net.Http.Json;
using System.Text.Json;
using Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Tests.Integration.Controllers;

public class ExpensesControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public ExpensesControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            
            builder.ConfigureServices(services =>
            {
                // Remove the Aspire SQL Server DbContext registration
                var descriptors = services.Where(d => 
                    d.ServiceType == typeof(ExpenseDbContext) ||
                    (d.ServiceType.IsGenericType && 
                     d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>)))
                    .ToList();
                
                foreach (var descriptor in descriptors)
                {
                    services.Remove(descriptor);
                }

                // Add InMemory database for testing
                services.AddDbContext<ExpenseDbContext>(options =>
                {
                    options.UseInMemoryDatabase($"TestDb_{Guid.NewGuid()}");
                });
            });
        });

        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task CreateExpense_ValidRawText_ReturnsExpenseId()
    {
        // Arrange
        var request = new { rawText = "Pizza delivery $24.50" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/Expenses", request);

        // Assert
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        var expenseId = JsonSerializer.Deserialize<int>(responseContent);
        Assert.True(expenseId > 0);
    }

    [Fact]
    public async Task GetExpenses_ReturnsExpensesList()
    {
        // Arrange - Create a test expense first
        var createRequest = new { rawText = "Coffee $5.75" };
        await _client.PostAsJsonAsync("/api/Expenses", createRequest);

        // Act
        var response = await _client.GetAsync("/api/Expenses");

        // Assert
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        Assert.Contains("Coffee", responseContent);
        Assert.Contains("5.75", responseContent);
    }

    [Fact]
    public async Task GetExpenseById_ExistingExpense_ReturnsExpense()
    {
        // Arrange - Create a test expense
        var createRequest = new { rawText = "Uber ride $18.00" };
        var createResponse = await _client.PostAsJsonAsync("/api/Expenses", createRequest);
        createResponse.EnsureSuccessStatusCode();
        
        var responseContent = await createResponse.Content.ReadAsStringAsync();
        var expenseId = JsonSerializer.Deserialize<int>(responseContent);

        // Act
        var getResponse = await _client.GetAsync($"/api/Expenses/{expenseId}");

        // Assert
        getResponse.EnsureSuccessStatusCode();
        var getResponseContent = await getResponse.Content.ReadAsStringAsync();
        Assert.Contains("Uber", getResponseContent);
        Assert.Contains("18", getResponseContent);
    }

    [Fact]
    public async Task UpdateExpense_ValidData_UpdatesExpense()
    {
        // Arrange - Create a test expense
        var createRequest = new { rawText = "Gas station $45.20" };
        var createResponse = await _client.PostAsJsonAsync("/api/Expenses", createRequest);
        var responseContent = await createResponse.Content.ReadAsStringAsync();
        var expenseId = JsonSerializer.Deserialize<int>(responseContent);

        var updateRequest = new 
        { 
            id = expenseId,
            description = "Updated gas station fill",
            amount = 50.00,
            category = "Transport"
        };

        // Act
        var updateResponse = await _client.PutAsJsonAsync($"/api/Expenses/{expenseId}", updateRequest);

        // Assert
        updateResponse.EnsureSuccessStatusCode();
        
        // Verify the update
        var getResponse = await _client.GetAsync($"/api/Expenses/{expenseId}");
        var getResponseContent = await getResponse.Content.ReadAsStringAsync();
        Assert.Contains("Updated gas station fill", getResponseContent);
        Assert.Contains("50", getResponseContent);
    }

    [Fact]
    public async Task DeleteExpense_ExistingExpense_RemovesExpense()
    {
        // Arrange - Create a test expense
        var createRequest = new { rawText = "Movie tickets $32.00" };
        var createResponse = await _client.PostAsJsonAsync("/api/Expenses", createRequest);
        var responseContent = await createResponse.Content.ReadAsStringAsync();
        var expenseId = JsonSerializer.Deserialize<int>(responseContent);

        // Act
        var deleteResponse = await _client.DeleteAsync($"/api/Expenses/{expenseId}");

        // Assert
        deleteResponse.EnsureSuccessStatusCode();
        
        // Verify the expense is deleted
        var getResponse = await _client.GetAsync($"/api/Expenses/{expenseId}");
        Assert.Equal(System.Net.HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Theory]
    [InlineData("Pizza delivery $24.50", "Food")]
    [InlineData("Uber to airport $18.00", "Transport")]
    [InlineData("Movie theater tickets $32.00", "Entertainment")]
    [InlineData("Doctor appointment $120.00", "Health")]
    [InlineData("Amazon shopping $45.99", "Shopping")]
    [InlineData("University textbook $89.99", "Education")]
    public async Task CreateExpense_VariousCategories_CategorizesCorrectly(string rawText, string expectedCategory)
    {
        // Arrange
        var request = new { rawText };

        // Act
        var createResponse = await _client.PostAsJsonAsync("/api/Expenses", request);
        createResponse.EnsureSuccessStatusCode();
        
        var responseContent = await createResponse.Content.ReadAsStringAsync();
        var expenseId = JsonSerializer.Deserialize<int>(responseContent);
        
        var getResponse = await _client.GetAsync($"/api/Expenses/{expenseId}");
        var getResponseContent = await getResponse.Content.ReadAsStringAsync();

        // Assert
        Assert.Contains($"\"category\":\"{expectedCategory}\"", getResponseContent);
    }
}