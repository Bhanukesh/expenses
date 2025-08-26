'use client'

import { useMemo } from 'react'
import { 
  useGetExpensesQuery, 
  useCreateExpenseMutation, 
  useDeleteExpenseMutation,
  useUpdateExpenseMutation,
  useGetExpenseSummaryQuery 
} from '@/store/api/enhanced/expenses'
import type { ExpenseItem } from '@/store/api/generated/expenses'
import { createExpenseSchema, naturalExpenseInputSchema, type UpdateExpenseInput } from '@/lib/validations'

interface UseExpensesOptions {
  filters?: {
    category?: string
    fromDate?: Date
    toDate?: Date
    tags?: string[]
    limit?: number
  }
}

export function useExpenses(options: UseExpensesOptions = {}) {
  // Convert Date objects to ISO strings for API
  const apiFilters = useMemo(() => {
    if (!options.filters) return {}
    
    return {
      ...options.filters,
      fromDate: options.filters.fromDate?.toISOString(),
      toDate: options.filters.toDate?.toISOString()
    }
  }, [options.filters])

  const { data: expenses = [], isLoading, error, refetch } = useGetExpensesQuery(apiFilters)
  const { data: summary, isLoading: isSummaryLoading } = useGetExpenseSummaryQuery(apiFilters)
  
  const [createExpenseMutation, { isLoading: isCreating, error: createError }] = useCreateExpenseMutation()
  const [updateExpenseMutation, { isLoading: isUpdating, error: updateError }] = useUpdateExpenseMutation()
  const [deleteExpenseMutation, { isLoading: isDeleting, error: deleteError }] = useDeleteExpenseMutation()

  // Calculate totals and summaries
  const totals = useMemo(() => {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const dailyExpenses = expenses.filter(expense => 
      new Date(expense.date!) >= startOfDay
    )
    const weeklyExpenses = expenses.filter(expense => 
      new Date(expense.date!) >= startOfWeek
    )
    const monthlyExpenses = expenses.filter(expense => 
      new Date(expense.date!) >= startOfMonth
    )

    return {
      daily: dailyExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
      weekly: weeklyExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
      monthly: monthlyExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
      total: expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
    }
  }, [expenses])

  // Group expenses by category
  const expensesByCategory = useMemo(() => {
    const grouped = expenses.reduce((acc, expense) => {
      const category = expense.category || 'Other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(expense)
      return acc
    }, {} as Record<string, ExpenseItem[]>)

    // Calculate totals for each category
    return Object.entries(grouped).map(([category, items]) => ({
      category,
      items,
      total: items.reduce((sum, item) => sum + (item.amount || 0), 0),
      count: items.length
    })).sort((a, b) => b.total - a.total)
  }, [expenses])

  // Recent expenses (last 5)
  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
      .slice(0, 5)
  }, [expenses])

  // Validated expense creation
  const handleCreateExpense = async (rawText: string) => {
    try {
      // Validate input using Zod
      const validatedInput = naturalExpenseInputSchema.parse({ input: rawText })
      const validatedExpense = createExpenseSchema.parse({ rawText: validatedInput.input })
      
      const result = await createExpenseMutation(validatedExpense.rawText).unwrap()
      return result
    } catch (error: unknown) {
      console.error('Failed to create expense:', error)
      // Handle validation errors
      if (error && typeof error === 'object' && 'issues' in error) {
        const issues = (error as { issues: Array<{ message?: string }> }).issues
        throw new Error(issues[0]?.message || 'Validation failed')
      }
      // Provide more detailed error information
      const errorData = error as { data?: { message?: string }; message?: string; status?: string }
      const errorMessage = errorData?.data?.message || errorData?.message || 'Unknown error occurred'
      const errorStatus = errorData?.status || 'Unknown status'
      console.error('Error details:', { status: errorStatus, message: errorMessage, fullError: error })
      throw new Error(`Failed to create expense: ${errorMessage} (Status: ${errorStatus})`)
    }
  }

  // Update expense with validation
  const handleUpdateExpense = async (updates: UpdateExpenseInput) => {
    try {
      const result = await updateExpenseMutation(updates).unwrap()
      return result
    } catch (error: unknown) {
      console.error('Failed to update expense:', error)
      throw error
    }
  }

  // Delete expense
  const handleDeleteExpense = async (id: number) => {
    try {
      const result = await deleteExpenseMutation(id).unwrap()
      return result
    } catch (error: unknown) {
      console.error('Failed to delete expense:', error)
      throw error
    }
  }

  // Get expenses for a specific category
  const getExpensesByCategory = (category: string) => {
    return expenses.filter((expense: ExpenseItem) => expense.category === category)
  }

  return {
    // Data
    expenses,
    totals,
    expensesByCategory,
    recentExpenses,
    summary,
    
    // Loading states
    isLoading,
    isSummaryLoading,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Operations
    createExpense: handleCreateExpense,
    updateExpense: handleUpdateExpense,
    deleteExpense: handleDeleteExpense,
    refetch,
    
    // Utilities
    getExpensesByCategory,
    
    // Errors
    error: error || createError || updateError || deleteError
  }
}

// Hook for expense statistics
export function useExpenseStats(filters?: UseExpensesOptions['filters']) {
  const { summary, isSummaryLoading } = useExpenses({ filters })
  
  return {
    categoryTotals: summary?.categoryTotals || [],
    totalAmount: summary?.totalAmount || 0,
    totalCount: summary?.totalCount || 0,
    recentExpenses: summary?.recentExpenses || [],
    isLoading: isSummaryLoading
  }
}