import re
from decimal import Decimal
from typing import Tuple, Dict
from models import CategorizeExpenseResponse


class ExpenseCategorizer:
    def __init__(self):
        # Core keywords for each category - minimal but focused
        self.categories = {
            'Food': {
                'keywords': ['restaurant', 'cafe', 'pizza', 'burger', 'coffee', 'lunch', 'dinner', 'breakfast'],
                'patterns': [r'\b(eat|ate|meal)\b']
            },
            'Transport': {
                'keywords': ['uber', 'taxi', 'cab', 'bus', 'gas', 'fuel', 'parking'],
                'patterns': [r'\b(ride|trip|travel)\b']
            },
            'Shopping': {
                'keywords': ['amazon', 'store', 'shop', 'mall', 'market'],
                'patterns': [r'\b(buy|bought|purchase)\b']
            },
            'Entertainment': {
                'keywords': ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert'],
                'patterns': [r'\b(watch|play)\b']
            },
            'Health': {
                'keywords': ['doctor', 'hospital', 'pharmacy', 'medicine', 'dentist'],
                'patterns': [r'\b(medical|health)\b']
            },
            'Education': {
                'keywords': ['school', 'university', 'book', 'course', 'tuition'],
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
    
    def _is_food_item(self, text: str) -> bool:
        """Logic-based food detection"""
        food_indicators = [
            # Common food endings
            r'\b\w*cake\b', r'\b\w*bread\b', r'\b\w*soup\b', r'\b\w*salad\b',
            # Food preparation/consumption
            r'\b(eat|ate|eating|drink|drinking|meal|snack|hungry|delicious)\b',
            # Specific food items
            r'\b(pizza|burger|sandwich|pasta|rice|chicken|beef|fish|cake|ice\s*cream|chocolate|cookies)\b',
            # Food-related places
            r'\b(restaurant|cafe|bakery|deli|kitchen|dining|takeout|delivery)\b',
            # Beverages
            r'\b(coffee|tea|juice|soda|beer|wine|water|smoothie|latte|cappuccino)\b',
            # Groceries
            r'\b(grocery|groceries|supermarket|food\s*market|fresh|produce)\b'
        ]
        return any(re.search(pattern, text, re.IGNORECASE) for pattern in food_indicators)
    
    def _is_transport_item(self, text: str) -> bool:
        """Logic-based transport detection"""
        transport_indicators = [
            # Transportation services
            r'\b(uber|lyft|taxi|cab|bus|train|flight|airline|metro|subway)\b',
            # Vehicle-related
            r'\b(gas|fuel|petrol|diesel|oil\s*change|tire|car\s*wash|parking|toll)\b',
            # Movement/travel
            r'\b(ride|trip|travel|drive|drove|commute|transport|journey)\b',
            # Transportation hubs
            r'\b(airport|station|terminal|garage)\b'
        ]
        return any(re.search(pattern, text, re.IGNORECASE) for pattern in transport_indicators)
    
    def _is_shopping_item(self, text: str) -> bool:
        """Logic-based shopping detection"""
        shopping_indicators = [
            # Shopping actions
            r'\b(buy|bought|purchase|shop|shopping|order|ordered)\b',
            # Shopping places
            r'\b(amazon|ebay|store|shop|mall|market|outlet|retail)\b',
            # Clothing/personal items
            r'\b(clothes|clothing|shirt|shoes|dress|pants|jacket|hat|bag|wallet)\b',
            # Personal care
            r'\b(makeup|cosmetics|shampoo|soap|perfume|skincare)\b'
        ]
        return any(re.search(pattern, text, re.IGNORECASE) for pattern in shopping_indicators)
    
    def _is_entertainment_item(self, text: str) -> bool:
        """Logic-based entertainment detection"""
        entertainment_indicators = [
            # Entertainment actions
            r'\b(watch|watching|play|playing|listen|listening)\b',
            # Entertainment venues/services
            r'\b(movie|cinema|theater|theatre|netflix|spotify|youtube|gaming|concert|show)\b',
            # Social/leisure
            r'\b(party|club|bar|pub|entertainment|leisure|fun|hobby)\b',
            # Subscriptions
            r'\b(subscription|streaming|membership)\b'
        ]
        return any(re.search(pattern, text, re.IGNORECASE) for pattern in entertainment_indicators)
    
    def _is_health_item(self, text: str) -> bool:
        """Logic-based health detection"""
        health_indicators = [
            # Healthcare providers
            r'\b(doctor|hospital|clinic|pharmacy|dentist|dental|medical)\b',
            # Health conditions/symptoms
            r'\b(sick|pain|hurt|ache|appointment|checkup|prescription|medicine|medication)\b',
            # Health-related
            r'\b(health|healthcare|treatment|therapy|surgery|vision|eye)\b'
        ]
        return any(re.search(pattern, text, re.IGNORECASE) for pattern in health_indicators)
    
    def _is_education_item(self, text: str) -> bool:
        """Logic-based education detection"""
        education_indicators = [
            # Educational actions
            r'\b(study|learn|learning|education|academic)\b',
            # Educational institutions
            r'\b(school|university|college|academy|course|class|tuition)\b',
            # Educational materials
            r'\b(book|textbook|notebook|supplies|pen|pencil)\b',
            # Learning platforms
            r'\b(udemy|coursera|training|workshop|seminar|certification)\b'
        ]
        return any(re.search(pattern, text, re.IGNORECASE) for pattern in education_indicators)
    
    def categorize_expense(self, description: str, amount: Decimal) -> CategorizeExpenseResponse:
        """Categorize an expense using logic-based detection"""
        text_lower = description.lower()
        
        # Apply logic-based categorization
        if self._is_food_item(text_lower):
            return CategorizeExpenseResponse(category='Food', confidence=0.9)
        elif self._is_transport_item(text_lower):
            return CategorizeExpenseResponse(category='Transport', confidence=0.9)
        elif self._is_shopping_item(text_lower):
            return CategorizeExpenseResponse(category='Shopping', confidence=0.9)
        elif self._is_entertainment_item(text_lower):
            return CategorizeExpenseResponse(category='Entertainment', confidence=0.9)
        elif self._is_health_item(text_lower):
            return CategorizeExpenseResponse(category='Health', confidence=0.9)
        elif self._is_education_item(text_lower):
            return CategorizeExpenseResponse(category='Education', confidence=0.9)
        
        # Fallback to keyword-based for edge cases
        category_scores = {}
        for category, rules in self.categories.items():
            score = 0.0
            for keyword in rules['keywords']:
                if keyword.lower() in text_lower:
                    score += 1.0
            for pattern in rules['patterns']:
                if re.search(pattern, text_lower):
                    score += 0.5
            if score > 0:
                category_scores[category] = score
        
        if category_scores:
            best_category = max(category_scores, key=category_scores.get)
            confidence = 0.7
        else:
            best_category = 'Other'
            confidence = 0.1
        
        return CategorizeExpenseResponse(category=best_category, confidence=confidence)


categorizer = ExpenseCategorizer()