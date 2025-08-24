namespace ApiService.Expense.Queries;

using MediatR;
using Microsoft.EntityFrameworkCore;
using Data;
using ApiService.Expense.DTO;

public record GetExpensesQuery : IRequest<IEnumerable<ExpenseItem>>;

public class GetExpensesQueryHandler(ExpenseDbContext context) : IRequestHandler<GetExpensesQuery, IEnumerable<ExpenseItem>>
{
    public async Task<IEnumerable<ExpenseItem>> Handle(GetExpensesQuery request, CancellationToken cancellationToken)
    {
        return await context.Expenses
            .OrderByDescending(x => x.Date)
            .Select(x => new ExpenseItem 
            { 
                Id = x.Id, 
                Description = x.Description, 
                Amount = x.Amount, 
                Category = x.Category, 
                Date = x.Date, 
                RawText = x.RawText 
            })
            .ToListAsync(cancellationToken);
    }
}
