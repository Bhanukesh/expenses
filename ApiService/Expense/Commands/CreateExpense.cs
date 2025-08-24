namespace ApiService.Expense.Commands;

using MediatR;
using Data;
using System.Text.Json;
using System.Text.RegularExpressions;

public record CreateExpenseCommand(string RawText) : IRequest<int>;

public class CreateExpenseHandler(ExpenseDbContext context, IHttpClientFactory httpClientFactory) : IRequestHandler<CreateExpenseCommand, int>
{
    public async Task<int> Handle(CreateExpenseCommand request, CancellationToken cancellationToken)
    {
        // Parse the raw text to extract description and amount
        var (description, amount) = ParseExpenseText(request.RawText);
        
        // Call Python API for categorization only
        var category = await GetCategoryFromPythonApi(description, amount, cancellationToken);

        // Create entity in SQL Server database
        var entity = new Expense
        {
            Description = description,
            Amount = amount,
            Category = category,
            Date = DateTime.Now,
            RawText = request.RawText
        };

        context.Expenses.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
    
    private static (string description, decimal amount) ParseExpenseText(string rawText)
    {
        // Simple parsing logic (similar to Python API)
        var text = rawText.Trim();
        
        // Try to find amount patterns: $12.50, 12.50, $12, 12
        var amountPatterns = new[]
        {
            @"\$(\d+\.?\d*)",  // $12.50 or $12
            @"(\d+\.?\d*)\s*\$",  // 12.50$ or 12$
            @"(\d+\.?\d*)",  // Just numbers (last resort)
        };
        
        decimal amount = 0;
        string description = text;
        
        foreach (var pattern in amountPatterns)
        {
            var matches = Regex.Matches(text, pattern, RegexOptions.IgnoreCase);
            if (matches.Count > 0)
            {
                if (decimal.TryParse(matches[^1].Groups[1].Value, out amount))
                {
                    // Remove the amount from description
                    description = Regex.Replace(text, @"\$?\d+\.?\d*\$?", "").Trim();
                    break;
                }
            }
        }
        
        return (string.IsNullOrEmpty(description) ? "Expense" : description, amount);
    }
    
    private async Task<string> GetCategoryFromPythonApi(string description, decimal amount, CancellationToken cancellationToken)
    {
        try
        {
            using var httpClient = httpClientFactory.CreateClient();
            httpClient.BaseAddress = new Uri("http://localhost:8000");
            
            var request = new { description, amount };
            var jsonContent = JsonSerializer.Serialize(request);
            var httpContent = new StringContent(jsonContent, System.Text.Encoding.UTF8, "application/json");
            
            var response = await httpClient.PostAsync("/api/Expenses/categorize", httpContent, cancellationToken);
            
            if (response.IsSuccessStatusCode)
            {
                var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
                var categorization = JsonSerializer.Deserialize<CategorizationResponse>(responseJson, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                });
                
                return categorization?.Category ?? "Other";
            }
        }
        catch
        {
            // Fall back to basic categorization if Python API is not available
        }
        
        // Basic fallback categorization
        return GetBasicCategory(description);
    }
    
    private static string GetBasicCategory(string description)
    {
        var lowerDesc = description.ToLower();
        
        if (lowerDesc.Contains("pizza") || lowerDesc.Contains("food") || lowerDesc.Contains("coffee") || lowerDesc.Contains("lunch"))
            return "Food";
        if (lowerDesc.Contains("uber") || lowerDesc.Contains("gas") || lowerDesc.Contains("transport"))
            return "Transport";
        if (lowerDesc.Contains("movie") || lowerDesc.Contains("entertainment"))
            return "Entertainment";
            
        return "Other";
    }
}

public class CategorizationResponse
{
    public string Category { get; set; } = string.Empty;
    public float Confidence { get; set; }
}
