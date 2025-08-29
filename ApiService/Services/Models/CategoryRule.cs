namespace ApiService.Services.Models;

public record CategoryRule(
    string Category,
    List<CategoryKeyword> Keywords,
    double MinimumScore = 1.0);

public static class CategoryRules
{
    public static readonly List<CategoryRule> Rules = new()
    {
        new CategoryRule("Food", new List<CategoryKeyword>
        {
            // Exact matches (highest weight)
            new("restaurant", 2.0),
            new("cafe", 2.0),
            new("bakery", 2.0),
            new("deli", 2.0),
            new("pizza", 2.0),
            new("burger", 2.0),
            new("coffee", 1.8),
            new("lunch", 1.8),
            new("dinner", 1.8),
            new("breakfast", 1.8),
            
            // Contains matches (medium weight)
            new("food", 1.5, CategoryKeywordType.Contains),
            new("eat", 1.5, CategoryKeywordType.Contains),
            new("meal", 1.5, CategoryKeywordType.Contains),
            new("kitchen", 1.2, CategoryKeywordType.Contains),
            new("dining", 1.2, CategoryKeywordType.Contains),
            
            // Specific food items
            new("sandwich", 1.0),
            new("pasta", 1.0),
            new("rice", 1.0),
            new("chicken", 1.0),
            new("beef", 1.0),
            new("fish", 1.0),
            new("salad", 1.0),
            new("soup", 1.0),
            
            // Beverages
            new("tea", 0.8),
            new("juice", 0.8),
            new("soda", 0.8),
            new("beer", 0.8),
            new("wine", 0.8),
            new("water", 0.5),
            
            // Grocery related
            new("grocery", 1.5),
            new("groceries", 1.5),
            new("supermarket", 1.5),
            new("fresh", 0.8, CategoryKeywordType.Contains),
            new("produce", 1.0)
        }, 1.0),
        
        new CategoryRule("Transport", new List<CategoryKeyword>
        {
            // Transport services
            new("uber", 2.0),
            new("lyft", 2.0),
            new("taxi", 2.0),
            new("cab", 2.0),
            new("bus", 1.8),
            new("train", 1.8),
            new("flight", 2.0),
            new("airline", 2.0),
            new("metro", 1.8),
            new("subway", 1.8),
            
            // Vehicle related
            new("gas", 1.5),
            new("fuel", 1.5),
            new("petrol", 1.5),
            new("diesel", 1.5),
            new("parking", 1.8),
            new("toll", 1.5),
            
            // Movement verbs
            new("ride", 1.0, CategoryKeywordType.Contains),
            new("trip", 1.0, CategoryKeywordType.Contains),
            new("travel", 1.0, CategoryKeywordType.Contains),
            new("drive", 1.0, CategoryKeywordType.Contains),
            new("commute", 1.5, CategoryKeywordType.Contains),
            
            // Transport hubs
            new("airport", 1.5),
            new("station", 1.2),
            new("terminal", 1.0),
            new("garage", 0.8)
        }, 1.0),
        
        new CategoryRule("Shopping", new List<CategoryKeyword>
        {
            // Shopping actions
            new("buy", 1.0, CategoryKeywordType.Contains),
            new("bought", 1.0, CategoryKeywordType.Contains),
            new("purchase", 1.5, CategoryKeywordType.Contains),
            new("shop", 1.5, CategoryKeywordType.Contains),
            new("shopping", 2.0),
            new("order", 1.0, CategoryKeywordType.Contains),
            new("ordered", 1.0, CategoryKeywordType.Contains),
            
            // Shopping places
            new("amazon", 2.0),
            new("ebay", 2.0),
            new("store", 1.5),
            new("mall", 2.0),
            new("market", 1.2),
            new("outlet", 1.5),
            new("retail", 1.5),
            
            // Clothing items
            new("clothes", 1.8),
            new("clothing", 1.8),
            new("shirt", 1.5),
            new("shoes", 1.5),
            new("dress", 1.5),
            new("pants", 1.5),
            new("jacket", 1.5),
            new("hat", 1.2),
            new("bag", 1.2),
            new("wallet", 1.5),
            
            // Personal care
            new("makeup", 1.5),
            new("cosmetics", 1.5),
            new("shampoo", 1.5),
            new("soap", 1.2),
            new("perfume", 1.5),
            new("skincare", 1.5)
        }, 1.0),
        
        new CategoryRule("Entertainment", new List<CategoryKeyword>
        {
            // Entertainment actions
            new("watch", 1.0, CategoryKeywordType.Contains),
            new("watching", 1.0, CategoryKeywordType.Contains),
            new("play", 1.0, CategoryKeywordType.Contains),
            new("playing", 1.0, CategoryKeywordType.Contains),
            new("listen", 1.0, CategoryKeywordType.Contains),
            new("listening", 1.0, CategoryKeywordType.Contains),
            
            // Entertainment services
            new("movie", 2.0),
            new("cinema", 2.0),
            new("theater", 2.0),
            new("theatre", 2.0),
            new("netflix", 2.0),
            new("spotify", 2.0),
            new("youtube", 1.5),
            new("gaming", 1.8),
            new("concert", 2.0),
            new("show", 1.5),
            
            // Social leisure
            new("party", 1.5),
            new("club", 1.5),
            new("bar", 1.8),
            new("pub", 1.8),
            new("entertainment", 2.0),
            new("leisure", 1.5),
            new("fun", 1.0),
            new("hobby", 1.5),
            
            // Subscriptions
            new("subscription", 1.8),
            new("streaming", 1.8),
            new("membership", 1.5)
        }, 1.0),
        
        new CategoryRule("Health", new List<CategoryKeyword>
        {
            // Healthcare providers
            new("doctor", 2.0),
            new("hospital", 2.0),
            new("clinic", 2.0),
            new("pharmacy", 2.0),
            new("dentist", 2.0),
            new("dental", 2.0),
            new("medical", 1.8),
            
            // Health conditions
            new("sick", 1.5),
            new("pain", 1.2),
            new("hurt", 1.2),
            new("ache", 1.2),
            new("appointment", 1.5),
            new("checkup", 2.0),
            new("prescription", 2.0),
            new("medicine", 1.8),
            new("medication", 1.8),
            
            // Health related
            new("health", 1.5, CategoryKeywordType.Contains),
            new("healthcare", 2.0),
            new("treatment", 1.8),
            new("therapy", 1.8),
            new("surgery", 2.0),
            new("vision", 1.5),
            new("eye", 1.2, CategoryKeywordType.Contains)
        }, 1.0),
        
        new CategoryRule("Education", new List<CategoryKeyword>
        {
            // Education actions
            new("study", 1.5, CategoryKeywordType.Contains),
            new("learn", 1.5, CategoryKeywordType.Contains),
            new("learning", 1.5, CategoryKeywordType.Contains),
            new("education", 2.0),
            new("academic", 1.8),
            
            // Education institutions
            new("school", 2.0),
            new("university", 2.0),
            new("college", 2.0),
            new("academy", 1.8),
            new("course", 1.8),
            new("class", 1.5),
            new("tuition", 2.0),
            
            // Education materials
            new("book", 1.2),
            new("textbook", 2.0),
            new("notebook", 1.5),
            new("supplies", 1.2, CategoryKeywordType.Contains),
            new("pen", 1.0),
            new("pencil", 1.0),
            
            // Learning platforms
            new("udemy", 2.0),
            new("coursera", 2.0),
            new("training", 1.8),
            new("workshop", 1.8),
            new("seminar", 1.8),
            new("certification", 1.8)
        }, 1.0)
    };
}