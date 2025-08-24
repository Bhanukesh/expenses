'use client'

import { useMemo } from 'react'
import { useGetExpensesQuery, useCreateExpenseMutation, useDeleteExpenseMutation } from '@/store/api/enhanced/expenses'
import type { ExpenseItem } from '@/store/api/generated/expenses'

export function useExpenses() {
  const { data: expenses = [], isLoading, error, refetch } = useGetExpensesQuery()
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation()
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation()

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

  const handleCreateExpense = async (rawText: string) => {
    try {
      await createExpense({ createExpenseCommand: { rawText } }).unwrap()
      refetch()
    } catch (error) {
      console.error('Failed to create expense:', error)
      throw error
    }
  }

  const handleDeleteExpense = async (id: number) => {
    try {
      await deleteExpense({ id }).unwrap()
      refetch()
    } catch (error) {
      console.error('Failed to delete expense:', error)
      throw error
    }
  }

  return {
    expenses,
    totals,
    expensesByCategory,
    recentExpenses,
    isLoading,
    isCreating,
    isDeleting,
    error,
    createExpense: handleCreateExpense,
    deleteExpense: handleDeleteExpense,
    refetch
  }
}