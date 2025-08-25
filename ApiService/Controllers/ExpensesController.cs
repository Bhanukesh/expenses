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
    public async Task<IEnumerable<ExpenseItem>> GetExpenses(
        [FromQuery] string? category = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] List<string>? tags = null,
        [FromQuery] int? limit = null)
    {
        return await mediator.Send(new GetExpensesQuery(category, fromDate, toDate, tags, limit));
    }

    [HttpPost(Name = nameof(CreateExpense))]
    public async Task<ActionResult<int>> CreateExpense(CreateExpenseCommand command)
    {
        var id = await mediator.Send(command);
        return CreatedAtAction(nameof(GetExpenseById), new { id }, id);
    }

    [HttpGet("{id}", Name = nameof(GetExpenseById))]
    public async Task<ActionResult<ExpenseItem?>> GetExpenseById(int id)
    {
        var expenses = await mediator.Send(new GetExpensesQuery(Limit: 1));
        var expense = expenses.FirstOrDefault(e => e.Id == id);
        
        if (expense == null)
            return NotFound();
            
        return Ok(expense);
    }

    [HttpPut("{id}", Name = nameof(UpdateExpense))]
    public async Task<IActionResult> UpdateExpense(int id, UpdateExpenseCommand command)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");
            
        var success = await mediator.Send(command);
        
        if (!success)
            return NotFound();
            
        return NoContent();
    }

    [HttpDelete("{id}", Name = nameof(DeleteExpense))]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        await mediator.Send(new DeleteExpenseCommand(id));
        return NoContent();
    }
}
