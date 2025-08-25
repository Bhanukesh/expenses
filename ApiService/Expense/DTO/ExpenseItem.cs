namespace ApiService.Expense.DTO;

public class ExpenseItem
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Subcategory { get; set; }
    public DateTime Date { get; set; }
    public string? RawText { get; set; }
    public List<string> Tags { get; set; } = [];
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsRecurring { get; set; }
    public string? Location { get; set; }
    public string? PaymentMethod { get; set; }
}
