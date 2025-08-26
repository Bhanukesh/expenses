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

        // Extract additional metadata from raw text
        var tags = ExtractTags(request.RawText);
        var location = ExtractLocation(request.RawText);
        
        // Create entity in SQL Server database
        var entity = new Expense
        {
            Description = description,
            Amount = amount,
            Category = category,
            Date = DateTime.UtcNow,
            RawText = request.RawText,
            Tags = tags,
            Location = location,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
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
        
        if (lowerDesc.Contains("pizza") || lowerDesc.Contains("food") || lowerDesc.Contains("coffee") || lowerDesc.Contains("lunch") || lowerDesc.Contains("dinner") || lowerDesc.Contains("restaurant"))
            return "Food";
        if (lowerDesc.Contains("uber") || lowerDesc.Contains("gas") || lowerDesc.Contains("transport") || lowerDesc.Contains("bus") || lowerDesc.Contains("taxi") || lowerDesc.Contains("metro"))
            return "Transport";
        if (lowerDesc.Contains("movie") || lowerDesc.Contains("entertainment") || lowerDesc.Contains("concert") || lowerDesc.Contains("game"))
            return "Entertainment";
        if (lowerDesc.Contains("shop") || lowerDesc.Contains("store") || lowerDesc.Contains("buy"))
            return "Shopping";
        if (lowerDesc.Contains("hospital") || lowerDesc.Contains("doctor") || lowerDesc.Contains("medicine") || lowerDesc.Contains("pharmacy"))
            return "Health";
        if (lowerDesc.Contains("book") || lowerDesc.Contains("course") || lowerDesc.Contains("school") || lowerDesc.Contains("university"))
            return "Education";
            
        return "Other";
    }
    
    private static List<string> ExtractTags(string rawText)
    {
        var tags = new List<string>();
        var lowerText = rawText.ToLower();
        
        // Common tags based on keywords
        var tagMap = new Dictionary<string, string[]>
        {
            ["lunch"] = ["lunch", "meal"],
            ["dinner"] = ["dinner", "meal"],
            ["breakfast"] = ["breakfast", "meal"],
            ["coffee"] = ["coffee", "drink"],
            ["campus"] = ["campus", "university"],
            ["work"] = ["work", "office"],
            ["home"] = ["home"],
            ["urgent"] = ["urgent", "emergency"],
            ["monthly"] = ["monthly", "recurring"],
            ["weekly"] = ["weekly", "recurring"]
        };
        
        foreach (var (keyword, keywordTags) in tagMap)
        {
            if (lowerText.Contains(keyword))
            {
                tags.AddRange(keywordTags);
            }
        }
        
        return tags.Distinct().ToList();
    }
    
    private static string? ExtractLocation(string rawText)
    {
        var lowerText = rawText.ToLower();
        
        // Common location patterns
        var locationKeywords = new[] { "at ", "from ", "near ", "in " };
        
        foreach (var keyword in locationKeywords)
        {
            var index = lowerText.IndexOf(keyword, StringComparison.OrdinalIgnoreCase);
            if (index >= 0)
            {
                var locationStart = index + keyword.Length;
                var remainingText = rawText.Substring(locationStart);
                
                // Take the next word(s) as location
                var words = remainingText.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (words.Length > 0)
                {
                    // Take up to 3 words as location
                    return string.Join(" ", words.Take(Math.Min(3, words.Length)));
                }
            }
        }
        
        return null;
    }
}

public class CategorizationResponse
{
    public string Category { get; set; } = string.Empty;
    public float Confidence { get; set; }
}
