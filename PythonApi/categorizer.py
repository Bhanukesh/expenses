import re
from decimal import Decimal
from typing import Tuple, Dict
from models import CategorizeExpenseResponse


class ExpenseCategorizer:
    def __init__(self):
        self.categories = {
            'Food': {
                'keywords': ['pizza', 'burger', 'coffee', 'lunch', 'dinner', 'breakfast', 'restaurant', 
                           'food', 'snack', 'drink', 'cafe', 'bar', 'McDonald', 'Starbucks', 'KFC'],
                'patterns': [r'\b(eat|ate|meal)\b']
            },
            'Transport': {
                'keywords': ['uber', 'taxi', 'bus', 'metro', 'gas', 'fuel', 'parking', 'train', 'flight'],
                'patterns': [r'\b(ride|trip|travel)\b']
            },
            'Shopping': {
                'keywords': ['store', 'shop', 'amazon', 'clothes', 'shirt', 'shoes', 'mall', 'market'],
                'patterns': [r'\b(buy|bought|purchase)\b']
            },
            'Entertainment': {
                'keywords': ['movie', 'cinema', 'game', 'spotify', 'netflix', 'concert', 'show'],
                'patterns': [r'\b(watch|play|entertainment)\b']
            },
            'Health': {
                'keywords': ['doctor', 'pharmacy', 'medicine', 'hospital', 'clinic', 'dentist'],
                'patterns': [r'\b(medical|health)\b']
            },
            'Utilities': {
                'keywords': ['electricity', 'water', 'internet', 'phone', 'bill'],
                'patterns': [r'\b(bill|utility)\b']
            },
            'Education': {
                'keywords': ['book', 'course', 'school', 'university', 'tuition'],
                'patterns': [r'\b(study|learn)\b']
            }
        }
    
    def parse_expense_text(self, raw_text: str) -> Tuple[str, Decimal]:
        """Parse raw expense text to extract description and amount"""
        # Remove extra whitespace
        text = raw_text.strip()
        
        # Try to find amount patterns: $12.50, 12.50, $12, 12
        amount_patterns = [
            r'\$(\d+\.?\d*)',  # $12.50 or $12
            r'(\d+\.?\d*)\s*\$',  # 12.50$ or 12$
            r'(\d+\.?\d*)',  # Just numbers (last resort)
        ]
        
        amount = Decimal('0.00')
        description = text
        
        for pattern in amount_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                try:
                    amount = Decimal(matches[-1])  # Take the last match
                    # Remove the amount from description
                    description = re.sub(r'\$?\d+\.?\d*\$?', '', text).strip()
                    break
                except:
                    continue
        
        # If no description remains, use original text without amount
        if not description:
            description = re.sub(r'\$?\d+\.?\d*\$?', '', text).strip()
        
        return description if description else "Expense", amount
    
    def categorize_expense(self, description: str, amount: Decimal) -> CategorizeExpenseResponse:
        """Categorize an expense based on description"""
        text_lower = description.lower()
        category_scores = {}
        
        for category, rules in self.categories.items():
            score = 0.0
            
            # Check keywords
            for keyword in rules['keywords']:
                if keyword.lower() in text_lower:
                    score += 1.0
            
            # Check patterns
            for pattern in rules['patterns']:
                if re.search(pattern, text_lower):
                    score += 0.5
            
            if score > 0:
                category_scores[category] = score
        
        # Determine best category
        if category_scores:
            best_category = max(category_scores, key=category_scores.get)
            confidence = min(category_scores[best_category] / 2.0, 1.0)  # Normalize confidence
        else:
            best_category = 'Other'
            confidence = 0.1
        
        return CategorizeExpenseResponse(category=best_category, confidence=confidence)


categorizer = ExpenseCategorizer()