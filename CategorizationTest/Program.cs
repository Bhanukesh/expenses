namespace TempCategorizationTest;

public class Program
{
    public static void Main()
    {
        Console.WriteLine("🧪 Testing Expense Categorization Logic");
        Console.WriteLine("=======================================");
        
        var testCases = new[]
        {
            ("pizza margherita", "Food"),
            ("starbucks coffee", "Food"),
            ("lunch at restaurant", "Food"),
            ("uber to airport", "Transport"),
            ("gas station fill", "Transport"),
            ("public transport", "Transport"),
            ("movie theater ticket", "Entertainment"),
            ("netflix subscription", "Entertainment"),
            ("concert ticket", "Entertainment"),
            ("doctor appointment", "Health"),
            ("pharmacy medicine", "Health"),
            ("random shopping", "Other"),
            ("unknown purchase", "Other")
        };
        
        int passed = 0;
        int total = testCases.Length;
        
        foreach (var (description, expectedCategory) in testCases)
        {
            var category = GetBasicCategory(description);
            
            bool testPassed = category == expectedCategory;
            
            if (testPassed)
            {
                Console.WriteLine($"✅ '{description}' -> {category}");
                passed++;
            }
            else
            {
                Console.WriteLine($"❌ '{description}' -> Expected: {expectedCategory} | Got: {category}");
            }
        }
        
        Console.WriteLine($"\n📊 Results: {passed}/{total} tests passed");
        
        if (passed == total)
        {
            Console.WriteLine("🎉 All categorization tests PASSED!");
        }
        else
        {
            Console.WriteLine("💥 Some tests FAILED!");
            Environment.Exit(1);
        }
    }
    
    private static string GetBasicCategory(string description)
    {
        var lowerDesc = description.ToLower();
        
        if (lowerDesc.Contains("pizza") || lowerDesc.Contains("food") || lowerDesc.Contains("coffee") || 
            lowerDesc.Contains("lunch") || lowerDesc.Contains("restaurant") || lowerDesc.Contains("starbucks"))
            return "Food";
            
        if (lowerDesc.Contains("uber") || lowerDesc.Contains("gas") || lowerDesc.Contains("transport") ||
            lowerDesc.Contains("airport"))
            return "Transport";
            
        if (lowerDesc.Contains("movie") || lowerDesc.Contains("entertainment") || lowerDesc.Contains("netflix") ||
            lowerDesc.Contains("concert") || lowerDesc.Contains("theater"))
            return "Entertainment";
            
        if (lowerDesc.Contains("doctor") || lowerDesc.Contains("pharmacy") || lowerDesc.Contains("medicine"))
            return "Health";
            
        return "Other";
    }
}