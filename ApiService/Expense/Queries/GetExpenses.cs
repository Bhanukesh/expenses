namespace ApiService.Expense.Queries;

using MediatR;
using Microsoft.EntityFrameworkCore;
using Data;
using ApiService.Expense.DTO;

public record GetExpensesQuery(
    string? Category = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    List<string>? Tags = null,
    int? Limit = null
) : IRequest<IEnumerable<ExpenseItem>>;

public class GetExpensesQueryHandler(ExpenseDbContext context) : IRequestHandler<GetExpensesQuery, IEnumerable<ExpenseItem>>
{
    public async Task<IEnumerable<ExpenseItem>> Handle(GetExpensesQuery request, CancellationToken cancellationToken)
    {
        var query = context.Expenses.AsQueryable();
        
        // Apply filters
        if (!string.IsNullOrEmpty(request.Category))
        {
            query = query.Where(x => x.Category == request.Category);
        }
        
        if (request.FromDate.HasValue)
        {
            query = query.Where(x => x.Date >= request.FromDate.Value);
        }
        
        if (request.ToDate.HasValue)
        {
            query = query.Where(x => x.Date <= request.ToDate.Value);
        }
        
        if (request.Tags != null && request.Tags.Count > 0)
        {
            // Check if any of the requested tags are in the expense tags
            foreach (var tag in request.Tags)
            {
                query = query.Where(x => x.Tags.Contains(tag));
            }
        }
        
        query = query.OrderByDescending(x => x.Date);
        
        if (request.Limit.HasValue)
        {
            query = query.Take(request.Limit.Value);
        }
        
        return await query
            .Select(x => new ExpenseItem 
            { 
                Id = x.Id, 
                Description = x.Description, 
                Amount = x.Amount, 
                Category = x.Category,
                Subcategory = x.Subcategory,
                Date = x.Date, 
                RawText = x.RawText,
                Tags = x.Tags,
                Notes = x.Notes,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,
                IsRecurring = x.IsRecurring,
                Location = x.Location,
                PaymentMethod = x.PaymentMethod
            })
            .ToListAsync(cancellationToken);
    }
}
