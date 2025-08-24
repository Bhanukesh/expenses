from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal


class ExpenseItem(BaseModel):
    id: int
    description: str
    amount: Decimal
    category: str
    date: datetime
    raw_text: Optional[str] = None


class CreateExpenseCommand(BaseModel):
    raw_text: str


class CategorizeExpenseRequest(BaseModel):
    description: str
    amount: Decimal


class CategorizeExpenseResponse(BaseModel):
    category: str
    confidence: float