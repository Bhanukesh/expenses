namespace ApiService.Expense.Commands;

using MediatR;
using Data;
using System.Text.RegularExpressions;
using ApiService.Services;

public record CreateExpenseCommand(string RawText) : IRequest<int>;

public class CreateExpenseHandler(ExpenseDbContext context, ExpenseCategorizer categorizer) : IRequestHandler<CreateExpenseCommand, int>
{
    public async Task<int> Handle(CreateExpenseCommand request, CancellationToken cancellationToken)
    {
        // Parse the raw text to extract description and amount
        var (description, amount) = ParseExpenseText(request.RawText);
        
        // Use C# categorization service
        var category = categorizer.CategorizeExpense(description);

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

