from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, RedirectResponse
from typing import List
from models import ExpenseItem, CreateExpenseCommand, CategorizeExpenseRequest, CategorizeExpenseResponse
from database import db
from categorizer import categorizer

app = FastAPI(title="Expense Tracker API", version="v1", docs_url="/swagger", redoc_url="/redoc")
app.title = "Expense Tracker API"
app.version = "v1"
app.description = "Smart Expense Tracker with automatic categorization"

# Configure CORS to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Send interactive user to swagger page by default
@app.get("/")
async def redirect_to_swagger():
    return RedirectResponse(url="/swagger")

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}

@app.get("/api/Expenses", response_model=List[ExpenseItem], tags=["Expenses"], operation_id="GetExpenses")
async def get_expenses():
    return db.get_all_expenses()

@app.post("/api/Expenses", response_model=int, tags=["Expenses"], operation_id="CreateExpense")
async def create_expense(command: CreateExpenseCommand):
    # Parse the raw text to extract description and amount
    description, amount = categorizer.parse_expense_text(command.raw_text)
    
    # Categorize the expense
    categorization = categorizer.categorize_expense(description, amount)
    
    # Store the expense
    expense_id = db.create_expense(
        description=description,
        amount=amount,
        category=categorization.category,
        raw_text=command.raw_text
    )
    
    return expense_id

@app.post("/api/Expenses/categorize", response_model=CategorizeExpenseResponse, tags=["Expenses"], operation_id="CategorizeExpense")
async def categorize_expense(request: CategorizeExpenseRequest):
    return categorizer.categorize_expense(request.description, request.amount)

@app.delete("/api/Expenses/{id}", tags=["Expenses"], operation_id="DeleteExpense")
async def delete_expense(id: int):
    success = db.delete_expense(id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    return Response(status_code=200)
