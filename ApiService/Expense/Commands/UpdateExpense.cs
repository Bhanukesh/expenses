namespace ApiService.Expense.Commands;

using MediatR;
using Data;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

public record UpdateExpenseCommand(
    int Id,
    [Required] string Description,
    [Range(0.01, double.MaxValue)] decimal Amount,
    [Required] string Category,
    string? Subcategory,
    DateTime? Date,
    List<string>? Tags,
    string? Notes,
    bool? IsRecurring,
    string? Location,
    string? PaymentMethod
) : IRequest<bool>;

public class UpdateExpenseHandler(ExpenseDbContext context) : IRequestHandler<UpdateExpenseCommand, bool>
{
    public async Task<bool> Handle(UpdateExpenseCommand request, CancellationToken cancellationToken)
    {
        var expense = await context.Expenses
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);
            
        if (expense == null)
            return false;
            
        // Update fields
        expense.Description = request.Description;
        expense.Amount = request.Amount;
        expense.Category = request.Category;
        expense.Subcategory = request.Subcategory;
        
        if (request.Date.HasValue)
            expense.Date = request.Date.Value;
            
        if (request.Tags != null)
            expense.Tags = request.Tags;
            
        expense.Notes = request.Notes;
        expense.Location = request.Location;
        expense.PaymentMethod = request.PaymentMethod;
        
        if (request.IsRecurring.HasValue)
            expense.IsRecurring = request.IsRecurring.Value;
            
        expense.UpdatedAt = DateTime.UtcNow;
        
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}