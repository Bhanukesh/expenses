namespace ApiService.Expense.Commands;

using MediatR;
using Data;

public record DeleteExpenseCommand(int Id) : IRequest<Unit>;

public class DeleteExpenseCommandHandler(ExpenseDbContext context) : IRequestHandler<DeleteExpenseCommand, Unit>
{
    public async Task<Unit> Handle(DeleteExpenseCommand request, CancellationToken cancellationToken)
    {
        var expense = await context.Expenses.FindAsync([request.Id], cancellationToken: cancellationToken);

        if (expense == null)
        {
            // Handle not found
            return Unit.Value;
        }

        context.Expenses.Remove(expense);

        await context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
