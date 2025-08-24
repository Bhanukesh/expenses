from typing import List, Optional
from models import ExpenseItem
import threading
from datetime import datetime
from decimal import Decimal


class InMemoryDatabase:
    def __init__(self):
        self._expenses: List[ExpenseItem] = []
        self._next_id = 1
        self._lock = threading.Lock()
    
    def get_all_expenses(self) -> List[ExpenseItem]:
        with self._lock:
            return self._expenses.copy()
    
    def create_expense(self, description: str, amount: Decimal, category: str, raw_text: str) -> int:
        with self._lock:
            expense = ExpenseItem(
                id=self._next_id,
                description=description,
                amount=amount,
                category=category,
                date=datetime.now(),
                raw_text=raw_text
            )
            self._expenses.append(expense)
            self._next_id += 1
            return expense.id
    
    def get_expense_by_id(self, id: int) -> Optional[ExpenseItem]:
        with self._lock:
            for expense in self._expenses:
                if expense.id == id:
                    return expense
            return None
    
    def delete_expense(self, id: int) -> bool:
        with self._lock:
            for i, expense in enumerate(self._expenses):
                if expense.id == id:
                    del self._expenses[i]
                    return True
            return False


db = InMemoryDatabase()