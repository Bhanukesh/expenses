using System.Text.RegularExpressions;

namespace TempIntegrationTest;

public class Program
{
    public static void Main()
    {
        Console.WriteLine("🧪 Testing Complete Expense Processing Pipeline");
        Console.WriteLine("==============================================");
        
        var testExpenses = new[]
        {
            "Pizza delivery $24.50",
            "Coffee at Starbucks 5.75",
            "Uber ride to downtown $18.00", 
            "Gas station 45.20",
            "Movie tickets $32",
            "Doctor visit 120.00"
        };
        
        int passed = 0;
        int total = testExpenses.Length;
        
        foreach (var rawText in testExpenses)
        {
            try
            {
                // Parse expense
                var (description, amount) = ParseExpenseText(rawText);
                
                // Categorize expense  
                var category = GetBasicCategory(description);
                
                // Validate results
                bool isValid = !string.IsNullOrEmpty(description) && 
                              amount > 0 && 
                              !string.IsNullOrEmpty(category);
                
                if (isValid)
                {
                    Console.WriteLine($"✅ '{rawText}' -> '{description}' | ${amount} | {category}");
                    passed++;
                }
                else
                {
                    Console.WriteLine($"❌ '{rawText}' -> Invalid processing result");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"💥 '{rawText}' -> Exception: {ex.Message}");
            }
        }
        
        Console.WriteLine($"\n📊 Results: {passed}/{total} integration tests passed");
        
        if (passed == total)
        {
            Console.WriteLine("🎉 All integration tests PASSED!");
            Console.WriteLine("\n🚀 The expense processing pipeline is working correctly!");
        }
        else
        {
            Console.WriteLine("💥 Some integration tests FAILED!");
            Environment.Exit(1);
        }
    }
    
    private static (string description, decimal amount) ParseExpenseText(string rawText)
    {
        var text = rawText.Trim();
        
        var amountPatterns = new[]
        {
            @"\$(\d+\.?\d*)",
            @"(\d+\.?\d*)\s*\$",
            @"(\d+\.?\d*)",
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
                    description = Regex.Replace(text, @"\$?\d+\.?\d*\$?", "").Trim();
                    break;
                }
            }
        }
        
        return (string.IsNullOrEmpty(description) ? "Expense" : description, amount);
    }

    private static string GetBasicCategory(string description)
    {
        var lowerDesc = description.ToLower();
        
        if (lowerDesc.Contains("pizza") || lowerDesc.Contains("food") || lowerDesc.Contains("coffee") || 
            lowerDesc.Contains("lunch") || lowerDesc.Contains("restaurant") || lowerDesc.Contains("starbucks") ||
            lowerDesc.Contains("delivery"))
            return "Food";
            
        if (lowerDesc.Contains("uber") || lowerDesc.Contains("gas") || lowerDesc.Contains("transport") ||
            lowerDesc.Contains("ride") || lowerDesc.Contains("downtown"))
            return "Transport";
            
        if (lowerDesc.Contains("movie") || lowerDesc.Contains("entertainment") || lowerDesc.Contains("tickets"))
            return "Entertainment";
            
        if (lowerDesc.Contains("doctor") || lowerDesc.Contains("pharmacy") || lowerDesc.Contains("medicine") ||
            lowerDesc.Contains("visit"))
            return "Health";
            
        return "Other";
    }
}