using ApiService.Services;
using Xunit;

namespace Tests.Unit.Services;

public class ExpenseCategorizerTests
{
    private readonly ExpenseCategorizer _categorizer = new();

    [Theory]
    [InlineData("Pizza margherita delivery", "Food")]
    [InlineData("Starbucks coffee morning", "Food")]
    [InlineData("Lunch at restaurant downtown", "Food")]
    [InlineData("Grocery shopping at supermarket", "Shopping")]
    [InlineData("Fresh produce from market", "Food")]
    [InlineData("Ice cream from bakery", "Food")]
    public void CategorizeExpense_FoodAndShoppingItems_ReturnsCorrectCategory(string description, string expectedCategory)
    {
        var result = _categorizer.CategorizeExpense(description);
        Assert.Equal(expectedCategory, result);
    }

    [Theory]
    [InlineData("Uber ride to airport", "Transport")]
    [InlineData("Gas station fill up", "Transport")]
    [InlineData("Bus transport ticket", "Transport")]
    [InlineData("Taxi to downtown", "Transport")]
    [InlineData("Flight to New York", "Transport")]
    [InlineData("Parking garage fee", "Transport")]
    public void CategorizeExpense_TransportItems_ReturnsTransportCategory(string description, string expectedCategory)
    {
        var result = _categorizer.CategorizeExpense(description);
        Assert.Equal(expectedCategory, result);
    }

    [Theory]
    [InlineData("Movie theater tickets", "Entertainment")]
    [InlineData("Netflix subscription monthly", "Entertainment")]
    [InlineData("Concert ticket purchase", "Entertainment")]
    [InlineData("Bar night out", "Entertainment")]
    [InlineData("Gaming subscription", "Entertainment")]
    [InlineData("Spotify premium membership", "Entertainment")]
    public void CategorizeExpense_EntertainmentItems_ReturnsEntertainmentCategory(string description, string expectedCategory)
    {
        var result = _categorizer.CategorizeExpense(description);
        Assert.Equal(expectedCategory, result);
    }

    [Theory]
    [InlineData("Doctor appointment visit", "Health")]
    [InlineData("Pharmacy prescription pickup", "Health")]
    [InlineData("Dental cleaning checkup", "Health")]
    [InlineData("Hospital emergency visit", "Health")]
    [InlineData("Medical treatment therapy", "Health")]
    [InlineData("Vision eye exam", "Health")]
    public void CategorizeExpense_HealthItems_ReturnsHealthCategory(string description, string expectedCategory)
    {
        var result = _categorizer.CategorizeExpense(description);
        Assert.Equal(expectedCategory, result);
    }

    [Theory]
    [InlineData("Amazon shopping purchase", "Shopping")]
    [InlineData("Mall clothing store", "Shopping")]
    [InlineData("New shoes purchase", "Shopping")]
    [InlineData("Makeup cosmetics order", "Shopping")]
    [InlineData("Outlet retail shopping", "Shopping")]
    public void CategorizeExpense_ShoppingItems_ReturnsShoppingCategory(string description, string expectedCategory)
    {
        var result = _categorizer.CategorizeExpense(description);
        Assert.Equal(expectedCategory, result);
    }

    [Theory]
    [InlineData("University tuition payment", "Education")]
    [InlineData("Online course Udemy", "Education")]
    [InlineData("Textbook purchase", "Education")]
    [InlineData("Workshop training seminar", "Education")]
    [InlineData("School supplies notebook", "Education")]
    public void CategorizeExpense_EducationItems_ReturnsEducationCategory(string description, string expectedCategory)
    {
        var result = _categorizer.CategorizeExpense(description);
        Assert.Equal(expectedCategory, result);
    }

    [Theory]
    [InlineData("Random unknown thing", "Other")]
    [InlineData("Miscellaneous expense", "Other")]
    [InlineData("", "Other")]
    [InlineData("   ", "Other")]
    [InlineData("Some completely random thing", "Other")]
    public void CategorizeExpense_UnknownItems_ReturnsOtherCategory(string description, string expectedCategory)
    {
        var result = _categorizer.CategorizeExpense(description);
        Assert.Equal(expectedCategory, result);
    }

    [Fact]
    public void CategorizeExpense_MultipleKeywords_ReturnsHighestScoringCategory()
    {
        // This should score higher for Food than Transport due to multiple food keywords
        var result = _categorizer.CategorizeExpense("Pizza delivery ride");
        Assert.Equal("Food", result);
    }

    [Fact]
    public void CategorizeExpense_CaseInsensitive_WorksCorrectly()
    {
        var result1 = _categorizer.CategorizeExpense("PIZZA");
        var result2 = _categorizer.CategorizeExpense("pizza");
        var result3 = _categorizer.CategorizeExpense("Pizza");
        
        Assert.Equal("Food", result1);
        Assert.Equal("Food", result2);
        Assert.Equal("Food", result3);
    }
}