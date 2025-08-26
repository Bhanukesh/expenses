using System.Text.RegularExpressions;

namespace ApiService.Services;

public class ExpenseCategorizer
{
    private static readonly Dictionary<string, List<string>> FoodIndicators = new()
    {
        { "FoodEndings", new() { @"\b\w*cake\b", @"\b\w*bread\b", @"\b\w*soup\b", @"\b\w*salad\b" } },
        { "FoodActions", new() { @"\b(eat|ate|eating|drink|drinking|meal|snack|hungry|delicious)\b" } },
        { "FoodItems", new() { @"\b(pizza|burger|sandwich|pasta|rice|chicken|beef|fish|cake|ice\s*cream|chocolate|cookies)\b" } },
        { "FoodPlaces", new() { @"\b(restaurant|cafe|bakery|deli|kitchen|dining|takeout|delivery)\b" } },
        { "Beverages", new() { @"\b(coffee|tea|juice|soda|beer|wine|water|smoothie|latte|cappuccino)\b" } },
        { "Groceries", new() { @"\b(grocery|groceries|supermarket|food\s*market|fresh|produce)\b" } }
    };

    private static readonly Dictionary<string, List<string>> TransportIndicators = new()
    {
        { "TransportServices", new() { @"\b(uber|lyft|taxi|cab|bus|train|flight|airline|metro|subway)\b" } },
        { "VehicleRelated", new() { @"\b(gas|fuel|petrol|diesel|oil\s*change|tire|car\s*wash|parking|toll)\b" } },
        { "Movement", new() { @"\b(ride|trip|travel|drive|drove|commute|transport|journey)\b" } },
        { "TransportHubs", new() { @"\b(airport|station|terminal|garage)\b" } }
    };

    private static readonly Dictionary<string, List<string>> ShoppingIndicators = new()
    {
        { "ShoppingActions", new() { @"\b(buy|bought|purchase|shop|shopping|order|ordered)\b" } },
        { "ShoppingPlaces", new() { @"\b(amazon|ebay|store|shop|mall|market|outlet|retail)\b" } },
        { "ClothingItems", new() { @"\b(clothes|clothing|shirt|shoes|dress|pants|jacket|hat|bag|wallet)\b" } },
        { "PersonalCare", new() { @"\b(makeup|cosmetics|shampoo|soap|perfume|skincare)\b" } }
    };

    private static readonly Dictionary<string, List<string>> EntertainmentIndicators = new()
    {
        { "EntertainmentActions", new() { @"\b(watch|watching|play|playing|listen|listening)\b" } },
        { "EntertainmentServices", new() { @"\b(movie|cinema|theater|theatre|netflix|spotify|youtube|gaming|concert|show)\b" } },
        { "SocialLeisure", new() { @"\b(party|club|bar|pub|entertainment|leisure|fun|hobby)\b" } },
        { "Subscriptions", new() { @"\b(subscription|streaming|membership)\b" } }
    };

    private static readonly Dictionary<string, List<string>> HealthIndicators = new()
    {
        { "HealthcareProviders", new() { @"\b(doctor|hospital|clinic|pharmacy|dentist|dental|medical)\b" } },
        { "HealthConditions", new() { @"\b(sick|pain|hurt|ache|appointment|checkup|prescription|medicine|medication)\b" } },
        { "HealthRelated", new() { @"\b(health|healthcare|treatment|therapy|surgery|vision|eye)\b" } }
    };

    private static readonly Dictionary<string, List<string>> EducationIndicators = new()
    {
        { "EducationActions", new() { @"\b(study|learn|learning|education|academic)\b" } },
        { "EducationInstitutions", new() { @"\b(school|university|college|academy|course|class|tuition)\b" } },
        { "EducationMaterials", new() { @"\b(book|textbook|notebook|supplies|pen|pencil)\b" } },
        { "LearningPlatforms", new() { @"\b(udemy|coursera|training|workshop|seminar|certification)\b" } }
    };

    public string CategorizeExpense(string description)
    {
        var text = description.ToLowerInvariant();

        if (IsCategory(text, FoodIndicators)) return "Food";
        if (IsCategory(text, TransportIndicators)) return "Transport";
        if (IsCategory(text, ShoppingIndicators)) return "Shopping";
        if (IsCategory(text, EntertainmentIndicators)) return "Entertainment";
        if (IsCategory(text, HealthIndicators)) return "Health";
        if (IsCategory(text, EducationIndicators)) return "Education";

        return "Other";
    }

    private static bool IsCategory(string text, Dictionary<string, List<string>> indicators)
    {
        return indicators.Values.SelectMany(patterns => patterns)
            .Any(pattern => Regex.IsMatch(text, pattern, RegexOptions.IgnoreCase));
    }
}