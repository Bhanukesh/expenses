'use client'

import { useState } from 'react'

// Types for our expense data
type Expense = {
  id: number
  description: string
  amount: number
  category: string
  date: string
  rawText?: string
}

type ExpensesByCategory = {
  [key: string]: Expense[]
}

export default function Page() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Categories for the kanban board
  const categories = [
    { name: 'Food', color: '#ff6b6b', bgColor: '#fff5f5' },
    { name: 'Transport', color: '#4ecdc4', bgColor: '#f0fdfc' },
    { name: 'Entertainment', color: '#45b7d1', bgColor: '#f0f9ff' },
    { name: 'Shopping', color: '#96ceb4', bgColor: '#f0fdf4' },
    { name: 'Health', color: '#feca57', bgColor: '#fffbeb' },
    { name: 'Bills', color: '#ff9ff3', bgColor: '#fdf4ff' },
    { name: 'Other', color: '#a8e6cf', bgColor: '#f0fdf0' }
  ]

  // Parse expense text to extract amount and description
  const parseExpenseText = (text: string) => {
    const amountMatch = text.match(/\$?(\d+\.?\d*)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    const description = text.replace(/\$?[\d.]+/g, '').trim() || 'Expense';
    return { amount, description };
  }

  // Simple categorization based on keywords
  const categorizeExpense = (description: string): string => {
    const desc = description.toLowerCase();
    if (desc.includes('coffee') || desc.includes('lunch') || desc.includes('dinner') || desc.includes('food') || desc.includes('restaurant') || desc.includes('pizza')) return 'Food';
    if (desc.includes('uber') || desc.includes('bus') || desc.includes('taxi') || desc.includes('gas') || desc.includes('fuel') || desc.includes('transport')) return 'Transport';
    if (desc.includes('movie') || desc.includes('game') || desc.includes('entertainment') || desc.includes('spotify') || desc.includes('netflix')) return 'Entertainment';
    if (desc.includes('store') || desc.includes('amazon') || desc.includes('shopping') || desc.includes('clothes') || desc.includes('buy')) return 'Shopping';
    if (desc.includes('doctor') || desc.includes('medicine') || desc.includes('pharmacy') || desc.includes('health') || desc.includes('hospital')) return 'Health';
    if (desc.includes('bill') || desc.includes('electric') || desc.includes('water') || desc.includes('internet') || desc.includes('phone') || desc.includes('rent')) return 'Bills';
    return 'Other';
  }

  // Group expenses by category for kanban view
  const expensesByCategory: ExpensesByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(expense)
    return acc
  }, {} as ExpensesByCategory)

  // Calculate totals
  const totals = {
    daily: expenses
      .filter(e => new Date(e.date).toDateString() === new Date().toDateString())
      .reduce((sum, e) => sum + e.amount, 0),
    weekly: expenses
      .filter(e => {
        const expenseDate = new Date(e.date)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return expenseDate >= weekAgo
      })
      .reduce((sum, e) => sum + e.amount, 0),
    monthly: expenses
      .filter(e => {
        const expenseDate = new Date(e.date)
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return expenseDate >= monthAgo
      })
      .reduce((sum, e) => sum + e.amount, 0)
  }

  // Handle expense input submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    setIsLoading(true)
    
    try {
      const { amount, description } = parseExpenseText(inputValue);
      const category = categorizeExpense(description);
      
      const newExpense: Expense = {
        id: Date.now(),
        description,
        amount,
        category,
        date: new Date().toISOString(),
        rawText: inputValue
      }

      setExpenses(prev => [newExpense, ...prev])
      setInputValue('')
    } catch (error) {
      console.error('Error adding expense:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete expense
  const deleteExpense = (id: number) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '1rem' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem 2rem', 
        borderRadius: '12px', 
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            color: '#1f2937'
          }}>
            💰 Smart Expense Notepad
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Quick expense tracking for busy people - just type naturally!
          </p>

          {/* Quick Input */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder='Type naturally: "Coffee $4.50", "Lunch at subway $8", "Gas $45.20"'
              disabled={isLoading}
              style={{
                flex: 1,
                minWidth: '300px',
                padding: '0.75rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isLoading || !inputValue.trim() ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isLoading ? 'Adding...' : 'Add Expense'}
            </button>
          </form>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>TODAY</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              ${totals.daily.toFixed(2)}
            </p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>THIS WEEK</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              ${totals.weekly.toFixed(2)}
            </p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>THIS MONTH</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              ${totals.monthly.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Kanban Board */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {categories.map((category) => {
            const categoryExpenses = expensesByCategory[category.name] || []
            const categoryTotal = categoryExpenses.reduce((sum, e) => sum + e.amount, 0)

            return (
              <div
                key={category.name}
                style={{
                  backgroundColor: category.bgColor,
                  borderRadius: '12px',
                  padding: '1.5rem',
                  minHeight: '300px',
                  border: `2px solid ${category.color}20`
                }}
              >
                {/* Category Header */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3 style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '600', 
                      color: category.color,
                      margin: 0
                    }}>
                      {category.name}
                    </h3>
                    <span style={{
                      backgroundColor: category.color,
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px'
                    }}>
                      {categoryExpenses.length}
                    </span>
                  </div>
                  {categoryTotal > 0 && (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                      Total: ${categoryTotal.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Expense Cards */}
                <div>
                  {categoryExpenses.length === 0 ? (
                    <p style={{ 
                      textAlign: 'center', 
                      color: '#9ca3af', 
                      fontStyle: 'italic',
                      padding: '2rem 0',
                      margin: 0
                    }}>
                      No expenses yet
                    </p>
                  ) : (
                    categoryExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        style={{
                          backgroundColor: 'white',
                          padding: '1rem',
                          borderRadius: '8px',
                          marginBottom: '0.75rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          border: `1px solid ${category.color}30`
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937', margin: 0 }}>
                            {expense.description}
                          </h4>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            style={{
                              color: '#ef4444',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              padding: '0.25rem'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                        <p style={{ fontSize: '1rem', fontWeight: 'bold', color: category.color, marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>
                          ${expense.amount.toFixed(2)}
                        </p>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          <p style={{ margin: '0 0 0.25rem 0' }}>{new Date(expense.date).toLocaleDateString()}</p>
                          {expense.rawText && (
                            <p style={{ fontStyle: 'italic', margin: 0 }}>"{expense.rawText}"</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {expenses.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            marginTop: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937', margin: '0 0 1rem 0' }}>
              Start Tracking Your Expenses
            </h3>
            <p style={{ color: '#6b7280', maxWidth: '500px', margin: '0 auto' }}>
              Add your first expense using the input above. Just type naturally like 
              "Coffee $4.50" and we'll automatically categorize it for you.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}