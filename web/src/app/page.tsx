'use client'

import { useState } from 'react'
import { useExpenses } from '@/hooks/useExpenses'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { naturalExpenseInputSchema } from '@/lib/validations'
import type { ExpenseItem } from '@/store/api/generated/expenses'

export default function Page() {
  const [inputValue, setInputValue] = useState('')
  const [selectedView, setSelectedView] = useState('kanban')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  
  const { theme, toggleTheme } = useTheme()
  
  // Apply filters based on selected options
  const filterOptions = {
    filters: selectedFilter === 'week' ? { 
      fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
    } : selectedFilter === 'month' ? { 
      fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
    } : undefined
  }
  
  const { 
    expenses, 
    totals, 
    expensesByCategory, 
    isLoading, 
    isCreating,
    createExpense,
    deleteExpense,
    error
  } = useExpenses(filterOptions)

  // Categories with updated colors and icons
  const categories = [
    { 
      name: 'Food', 
      icon: '🍕',
      color: 'bg-orange-100 border-orange-200 text-orange-900',
      badgeColor: 'bg-orange-500',
      darkColor: 'dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-100'
    },
    { 
      name: 'Transport', 
      icon: '🚗',
      color: 'bg-blue-100 border-blue-200 text-blue-900',
      badgeColor: 'bg-blue-500',
      darkColor: 'dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100'
    },
    { 
      name: 'Entertainment', 
      icon: '🎬',
      color: 'bg-purple-100 border-purple-200 text-purple-900',
      badgeColor: 'bg-purple-500',
      darkColor: 'dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-100'
    },
    { 
      name: 'Shopping', 
      icon: '🛍️',
      color: 'bg-green-100 border-green-200 text-green-900',
      badgeColor: 'bg-green-500',
      darkColor: 'dark:bg-green-900/20 dark:border-green-800 dark:text-green-100'
    },
    { 
      name: 'Health', 
      icon: '⚕️',
      color: 'bg-red-100 border-red-200 text-red-900',
      badgeColor: 'bg-red-500',
      darkColor: 'dark:bg-red-900/20 dark:border-red-800 dark:text-red-100'
    },
    { 
      name: 'Education', 
      icon: '📚',
      color: 'bg-yellow-100 border-yellow-200 text-yellow-900',
      badgeColor: 'bg-yellow-500',
      darkColor: 'dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-100'
    },
    { 
      name: 'Other', 
      icon: '📦',
      color: 'bg-gray-100 border-gray-200 text-gray-900',
      badgeColor: 'bg-gray-500',
      darkColor: 'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100'
    }
  ]

  // Get category counts and totals from the hook
  const getCategoryCount = (categoryName: string) => {
    return expensesByCategory.find(cat => cat.category === categoryName)?.count || 0
  }

  const getCategoryTotal = (categoryName: string) => {
    const categoryData = expensesByCategory.find(cat => cat.category === categoryName)
    if (!categoryData?.items) return 0
    return categoryData.items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
  }


  // Handle expense input submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isCreating) return
    
    // Clear any previous validation errors
    setValidationError(null)
    
    try {
      // Client-side validation using Zod
      const validationResult = naturalExpenseInputSchema.safeParse({ input: inputValue.trim() })
      
      if (!validationResult.success) {
        const errorMessage = validationResult.error.issues[0]?.message || 'Invalid input'
        setValidationError(errorMessage)
        return
      }
      
      await createExpense(inputValue.trim())
      setInputValue('')
    } catch (error: any) {
      console.error('Error adding expense:', error)
      // Set validation error to show inline
      setValidationError(error?.message || error?.data?.message || 'Failed to add expense')
    }
  }

  // Handle expense deletion
  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id)
      } catch (error: any) {
        console.error('Error deleting expense:', error)
        alert(`Failed to delete expense: ${error.message || 'Please try again'}`)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Smart Expense Notepad</h2>
          <p className="text-muted-foreground">Loading your expenses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="p-8 text-center max-w-md">
          <CardContent>
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2 text-destructive">Failed to Load Expenses</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error?.message || error?.data?.message || 'Could not connect to the API service'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Fixed Left Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Dashboard Header */}
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-muted-foreground mb-4">Dashboard</h1>
            
            {/* Today's Total */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg mb-6">
              <div className="text-sm text-muted-foreground mb-1">💵 Today's Total</div>
              <div className="text-3xl font-bold">${totals.daily.toFixed(2)}</div>
            </div>
          </div>

          {/* Views Navigation */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-muted-foreground">Views</h3>
            <div className="space-y-1">
              <button 
                onClick={() => setSelectedView('kanban')}
                className={`flex items-center gap-2 p-2 text-sm rounded-md w-full text-left transition-colors ${
                  selectedView === 'kanban' ? 'bg-secondary' : 'hover:bg-secondary/50'
                }`}
              >
                <span>📊</span>
                <span>Kanban Board</span>
              </button>
              <button 
                onClick={() => setSelectedView('analytics')}
                className={`flex items-center gap-2 p-2 text-sm rounded-md w-full text-left transition-colors ${
                  selectedView === 'analytics' ? 'bg-secondary' : 'hover:bg-secondary/50'
                }`}
              >
                <span>📈</span>
                <span>Analytics</span>
              </button>
              <button 
                onClick={() => setSelectedView('calendar')}
                className={`flex items-center gap-2 p-2 text-sm rounded-md w-full text-left transition-colors ${
                  selectedView === 'calendar' ? 'bg-secondary' : 'hover:bg-secondary/50'
                }`}
              >
                <span>📅</span>
                <span>Calendar View</span>
              </button>
              <button 
                onClick={() => setSelectedView('trends')}
                className={`flex items-center gap-2 p-2 text-sm rounded-md w-full text-left transition-colors ${
                  selectedView === 'trends' ? 'bg-secondary' : 'hover:bg-secondary/50'
                }`}
              >
                <span>📈</span>
                <span>Trends</span>
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
            <div className="space-y-2">
              {categories.map(category => {
                const total = getCategoryTotal(category.name)
                return (
                  <button 
                    key={category.name}
                    onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                    className={`flex items-center justify-between text-sm w-full p-2 rounded-md transition-colors ${
                      selectedCategory === category.name ? 'bg-secondary' : 'hover:bg-secondary/50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </span>
                    <span className="font-medium text-blue-600">${total.toFixed(2)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-muted-foreground">Filters</h3>
            <div className="space-y-1">
              <button 
                onClick={() => setSelectedFilter(selectedFilter === 'week' ? 'all' : 'week')}
                className={`flex items-center gap-2 p-2 text-sm rounded-md w-full text-left transition-colors ${
                  selectedFilter === 'week' ? 'bg-secondary' : 'hover:bg-secondary/50'
                }`}
              >
                <span>⏰</span>
                <span>This Week</span>
              </button>
              <button 
                onClick={() => setSelectedFilter(selectedFilter === 'month' ? 'all' : 'month')}
                className={`flex items-center gap-2 p-2 text-sm rounded-md w-full text-left transition-colors ${
                  selectedFilter === 'month' ? 'bg-secondary' : 'hover:bg-secondary/50'
                }`}
              >
                <span>📅</span>
                <span>This Month</span>
              </button>
            </div>
          </div>
        </div>

        {/* Settings at bottom */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              <span>⚙️</span>
              <span>Settings</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="rounded-full p-2"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Smart Expense Notepad</h1>
              <p className="text-muted-foreground">Track expenses naturally with Kanban boards</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">Total: ${(totals.monthly || 0).toFixed(2)}</div>
            </div>
          </div>

          {/* Input Form */}
          <div className="space-y-2">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                type="text"
                placeholder="Type your expense... (e.g., 'Pizza $12', 'Uber ride $8')"
                className={`flex-1 ${validationError ? 'border-destructive' : ''}`}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  if (validationError) setValidationError(null) // Clear error on input
                }}
              />
              <Button 
                type="submit" 
                disabled={isCreating || !inputValue.trim()}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isCreating ? 'Adding...' : '+ Add'}
              </Button>
            </form>
            {validationError && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                ⚠️ {validationError}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {expenses.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">Start Tracking Your Expenses</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Add your first expense using the input above. Just type naturally like "Coffee $4.50" 
                  and we'll automatically categorize it for you.
                </p>
              </CardContent>
            </Card>
          ) : (
            /* Expense Categories - Kanban Style */
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {categories.map(category => {
                const count = getCategoryCount(category.name)
                const total = getCategoryTotal(category.name)
                const categoryExpenses = (expensesByCategory.find(cat => cat.category === category.name)?.items || []) as ExpenseItem[]
                
                return (
                  <Card key={category.name} className={`${category.color} ${category.darkColor} border-2 h-fit`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <h3 className="font-semibold">{category.name}</h3>
                        </div>
                        <Badge className={`${category.badgeColor} text-white`}>
                          {count}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        Total: ${total.toFixed(2)}
                      </div>

                      <div className="space-y-2">
                        {categoryExpenses.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">No expenses yet</p>
                        ) : (
                          categoryExpenses.slice(0, 4).map((expense: ExpenseItem) => (
                            <Card key={expense.id} className="bg-background/50 backdrop-blur-sm">
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{expense.description}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {new Date(expense.date || '').toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-2">
                                    <span className="font-semibold text-teal-600 text-sm">
                                      ${expense.amount?.toFixed(2)}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(expense.id!)}
                                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                    >
                                      🗑️
                                    </Button>
                                  </div>
                                </div>
                                {/* Tags */}
                                {(expense.rawText?.includes('lunch') || expense.rawText?.includes('campus')) && (
                                  <div className="flex gap-1 mt-2">
                                    {expense.rawText?.includes('lunch') && (
                                      <Badge variant="secondary" className="text-xs px-2 py-0 bg-orange-500 text-white">
                                        lunch
                                      </Badge>
                                    )}
                                    {expense.rawText?.includes('campus') && (
                                      <Badge variant="secondary" className="text-xs px-2 py-0 bg-orange-500 text-white">
                                        campus
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))
                        )}
                        {categoryExpenses.length > 4 && (
                          <p className="text-center text-xs text-muted-foreground">
                            +{categoryExpenses.length - 4} more expenses
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}