namespace ApiService.Controllers;

using MediatR;
using Microsoft.AspNetCore.Mvc;
using ApiService.Expense.Commands;
using ApiService.Expense.Queries;
using ApiService.Expense.DTO;

[ApiController]
[Route("api/[controller]")]
public class ExpensesController(IMediator mediator) : ControllerBase
{
    [HttpGet(Name = nameof(GetExpenses))]
    public async Task<IEnumerable<ExpenseItem>> GetExpenses()
    {
        return await mediator.Send(new GetExpensesQuery());
    }

    [HttpPost(Name = nameof(CreateExpense))]
    public async Task<ActionResult<int>> CreateExpense(CreateExpenseCommand command)
    {
        return await mediator.Send(command);
    }

    [HttpDelete("{id}", Name = nameof(DeleteExpense))]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        await mediator.Send(new DeleteExpenseCommand(id));
        return NoContent();
    }
}
