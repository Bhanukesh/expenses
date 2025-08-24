namespace ApiService.Expense.DTO;

public class ExpenseItem
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Category { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string? RawText { get; set; }
}
