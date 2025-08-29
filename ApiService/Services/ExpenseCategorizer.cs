using ApiService.Services.Models;

namespace ApiService.Services;

public class ExpenseCategorizer
{
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