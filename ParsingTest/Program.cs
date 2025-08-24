using System.Text.RegularExpressions;

namespace TempParsingTest;

public class Program
{
    public static void Main()
    {
        Console.WriteLine("🧪 Testing Expense Parsing Logic");
        Console.WriteLine("================================");
        
        var testCases = new[]
        {
            ("Pizza $12.50", "Pizza", 12.50m),
            ("Coffee 4.25", "Coffee", 4.25m),
            ("$8 lunch", "lunch", 8.00m),
            ("Gas station 25.50", "Gas station", 25.50m),
            ("Uber ride $15", "Uber ride", 15.00m),
            ("Movie ticket 18.99", "Movie ticket", 18.99m)
        };
        
        int passed = 0;
        int total = testCases.Length;
        
        foreach (var (rawText, expectedDesc, expectedAmount) in testCases)
        {
            var (description, amount) = ParseExpenseText(rawText);
            
            bool testPassed = description == expectedDesc && amount == expectedAmount;
            
            if (testPassed)
            {
                Console.WriteLine($"✅ '{rawText}' -> '{description}', ${amount}");
                passed++;
            }
            else
            {
                Console.WriteLine($"❌ '{rawText}' -> Expected: '{expectedDesc}', ${expectedAmount} | Got: '{description}', ${amount}");
            }
        }
        
        Console.WriteLine($"\n📊 Results: {passed}/{total} tests passed");
        
        if (passed == total)
        {
            Console.WriteLine("🎉 All parsing tests PASSED!");
        }
        else
        {
            Console.WriteLine("💥 Some tests FAILED!");
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
}