using OpenAI;
using OpenAI.Chat;

namespace ApiService.Services;

public class SemanticExpenseCategorizer(OpenAIClient openAIClient)
{
    private readonly OpenAIClient _openAIClient = openAIClient;
    
    private static readonly string[] ValidCategories = 
    [
        "Food", 
        "Transport", 
        "Shopping", 
        "Entertainment", 
        "Health", 
        "Education", 
        "Other"
    ];

    public async Task<string> CategorizeExpenseAsync(string description, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(description))
            return "Other";
            
        if (description.Length > 500)
            description = description[..500]; // Truncate to avoid excessive API costs
            
        var systemPrompt = $"""
            You are an expense categorization assistant. Your task is to categorize expense descriptions into one of these categories:
            
            Categories:
            - Food: Restaurants, groceries, dining, beverages, food delivery
            - Transport: Uber, taxi, gas, parking, public transport, flights, car maintenance
            - Shopping: Clothing, electronics, household items, online purchases, retail
            - Entertainment: Movies, concerts, games, subscriptions, bars, leisure activities
            - Health: Medical expenses, pharmacy, dental, healthcare, fitness
            - Education: Courses, books, training, school fees, learning materials
            - Other: Everything else that doesn't fit the above categories
            
            Rules:
            1. Respond with ONLY the category name (e.g., "Food", "Transport", etc.)
            2. If uncertain, choose the most likely category
            3. Be consistent with similar descriptions
            4. Consider context clues in the description
            """;

        var userPrompt = $"Categorize this expense: {description}";

        try
        {
            var chatCompletion = await _openAIClient.GetChatClient("gpt-3.5-turbo").CompleteChatAsync(
                [
                    new SystemChatMessage(systemPrompt),
                    new UserChatMessage(userPrompt)
                ],
                new ChatCompletionOptions
                {
                    MaxOutputTokenCount = 50,
                    Temperature = 0.1f
                },
                cancellationToken);

            var response = chatCompletion.Value.Content[0].Text.Trim();
            
            // Validate response is one of our valid categories
            var matchedCategory = ValidCategories.FirstOrDefault(cat => 
                string.Equals(cat, response, StringComparison.OrdinalIgnoreCase));
            
            return matchedCategory ?? "Other";
        }
        catch (Exception)
        {
            // Log the error if you have logging configured
            // For now, return "Other" as fallback for any OpenAI errors (rate limit, network, etc.)
            return "Other";
        }
    }

    public async Task<List<string>> ExtractTagsAsync(string description, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(description))
            return new List<string>();
            
        if (description.Length > 500)
            description = description[..500]; // Truncate to avoid excessive API costs
            
        var systemPrompt = """
            You are a tag extraction assistant. Extract 2-5 relevant tags from expense descriptions.
            
            Guidelines:
            - Extract meaningful, descriptive tags
            - Focus on: purpose, context, type, timing, social aspects
            - Use single words or short phrases
            - Make tags useful for filtering and searching
            - Examples:
              "Team lunch at Italian restaurant" → "team, work, meal, italian, social"
              "Monthly gym membership" → "fitness, health, recurring, monthly"
              "Coffee with client" → "coffee, business, meeting, beverage"
            
            Rules:
            1. Return tags as comma-separated list
            2. Use lowercase
            3. No special characters
            4. 2-5 tags maximum
            """;

        var userPrompt = $"Extract tags from: {description}";

        try
        {
            var chatCompletion = await _openAIClient.GetChatClient("gpt-3.5-turbo").CompleteChatAsync(
                [
                    new SystemChatMessage(systemPrompt),
                    new UserChatMessage(userPrompt)
                ],
                new ChatCompletionOptions
                {
                    MaxOutputTokenCount = 100,
                    Temperature = 0.2f
                },
                cancellationToken);

            var response = chatCompletion.Value.Content[0].Text.Trim();
            
            // Parse comma-separated tags
            var tags = response.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(tag => tag.Trim().ToLower())
                .Where(tag => !string.IsNullOrWhiteSpace(tag) && tag.Length > 1)
                .Take(5) // Limit to 5 tags
                .ToList();
            
            return tags;
        }
        catch (Exception)
        {
            // If AI fails (rate limit, network, etc.), return empty list
            return new List<string>();
        }
    }
}