using ApiService.Services.Models;

namespace ApiService.Services;

public class ExpenseCategorizer(SemanticExpenseCategorizer? semanticCategorizer = null)
{
    private readonly SemanticExpenseCategorizer? _semanticCategorizer = semanticCategorizer;

    public string CategorizeExpense(string description)
    {
        var text = description.ToLowerInvariant().Trim();
        var words = text.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        
        var categoryScores = new Dictionary<string, double>();
        
        foreach (var rule in CategoryRules.Rules)
        {
            var score = CalculateCategoryScore(text, words, rule.Keywords);
            if (score >= rule.MinimumScore)
            {
                categoryScores[rule.Category] = score;
            }
        }
        
        return categoryScores.Count > 0 
            ? categoryScores.OrderByDescending(kvp => kvp.Value).First().Key
            : "Other";
    }
    
    public async Task<string> CategorizeExpenseAsync(string description, CancellationToken cancellationToken = default)
    {
        var category = CategorizeExpense(description);
        
        // If rule-based categorization returns "Other" and semantic categorizer is available,
        // try semantic categorization as a fallback
        if (category == "Other" && _semanticCategorizer != null)
        {
            try
            {
                return await _semanticCategorizer.CategorizeExpenseAsync(description, cancellationToken);
            }
            catch
            {
                // If semantic categorization fails, fall back to rule-based result
                return category;
            }
        }
        
        return category;
    }

    public async Task<List<string>> ExtractTagsAsync(string description, CancellationToken cancellationToken = default)
    {
        // If semantic categorizer is available, use it for tag extraction
        if (_semanticCategorizer != null)
        {
            try
            {
                return await _semanticCategorizer.ExtractTagsAsync(description, cancellationToken);
            }
            catch
            {
                // If semantic extraction fails, fall back to rule-based
            }
        }
        
        // Fallback to rule-based tag extraction
        return ExtractTagsRuleBased(description);
    }

    public List<string> ExtractTagsRuleBased(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
            return new List<string>();
            
        var tags = new List<string>();
        var lowerText = description.ToLower();
        
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
    
    private static double CalculateCategoryScore(string text, string[] words, List<CategoryKeyword> keywords)
    {
        double totalScore = 0;
        
        foreach (var keyword in keywords)
        {
            var keywordLower = keyword.Keyword.ToLowerInvariant();
            bool found = keyword.Type switch
            {
                CategoryKeywordType.Exact => words.Contains(keywordLower),
                CategoryKeywordType.Contains => text.Contains(keywordLower),
                CategoryKeywordType.StartsWith => words.Any(w => w.StartsWith(keywordLower)),
                CategoryKeywordType.EndsWith => words.Any(w => w.EndsWith(keywordLower)),
                _ => false
            };
            
            if (found)
            {
                totalScore += keyword.Weight;
            }
        }
        
        return totalScore;
    }
}