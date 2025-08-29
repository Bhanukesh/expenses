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
        // Validate input
        if (string.IsNullOrWhiteSpace(request.RawText))
        {
            throw new ArgumentException("Expense text cannot be empty", nameof(request));
        }

        if (request.RawText.Length > 1000)
        {
            throw new ArgumentException("Expense text is too long (max 1000 characters)", nameof(request));
        }

        // Parse the raw text to extract description and amount
        var (description, amount) = ParseExpenseText(request.RawText);
        
        // Use C# categorization service with semantic fallback
        var category = await categorizer.CategorizeExpenseAsync(description, cancellationToken);

        // Extract additional metadata from raw text
        var tags = await categorizer.ExtractTagsAsync(description, cancellationToken);
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
            @"\$(\d+(?:\.\d{1,2})?)\b",  // $12.50 or $12 (word boundary, max 2 decimals)
            @"\b(\d+(?:\.\d{1,2})?)\s*\$",  // 12.50$ or 12$ (word boundary)
            @"\b(\d+(?:\.\d{1,2})?)\b",  // Just numbers with word boundaries (last resort)
        };
        
        decimal amount = 0;
        string description = text;
        
        foreach (var pattern in amountPatterns)
        {
            var matches = Regex.Matches(text, pattern, RegexOptions.IgnoreCase);
            if (matches.Count > 0)
            {
                var lastMatch = matches[^1];
                if (decimal.TryParse(lastMatch.Groups[1].Value, out amount))
                {
                    var matchedAmountText = lastMatch.Value;
                    // Remove the specific matched amount from description
                    description = text.Replace(matchedAmountText, "").Trim();
                    // Clean up extra spaces
                    description = Regex.Replace(description, @"\s+", " ").Trim();
                    break;
                }
            }
        }
        
        return (string.IsNullOrEmpty(description) ? "Expense" : description, amount);
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
                if (locationStart < rawText.Length)
                {
                    var remainingText = rawText[locationStart..];
                    
                    // Take the next word(s) as location
                    var words = remainingText.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                    if (words.Length > 0)
                    {
                        // Take up to 3 words as location
                        return string.Join(" ", words.Take(Math.Min(3, words.Length)));
                    }
                }
            }
        }
        
        return null;
    }
}

