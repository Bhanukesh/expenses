'use client'

import { useState, useMemo } from 'react'
import type { ExpenseItem } from '@/store/api/generated/expenses'

export interface ExpenseFilters {
  searchQuery: string
  category: string
  dateRange: 'all' | 'today' | 'week' | 'month'
  minAmount?: number
  maxAmount?: number
}

export function useExpenseFilters(expenses: ExpenseItem[]) {
  const [filters, setFilters] = useState<ExpenseFilters>({
    searchQuery: '',
    category: 'all',
    dateRange: 'all'
  })

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchesDescription = expense.description?.toLowerCase().includes(query)
        const matchesRawText = expense.rawText?.toLowerCase().includes(query)
        const matchesCategory = expense.category?.toLowerCase().includes(query)
        
        if (!matchesDescription && !matchesRawText && !matchesCategory) {
          return false
        }
      }

      // Category filter
      if (filters.category !== 'all' && expense.category !== filters.category) {
        return false
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const expenseDate = new Date(expense.date!)
        const today = new Date()
        
        switch (filters.dateRange) {
          case 'today':
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            if (expenseDate < startOfDay) return false
            break
          case 'week':
            const startOfWeek = new Date(today)
            startOfWeek.setDate(today.getDate() - today.getDay())
            startOfWeek.setHours(0, 0, 0, 0)
            if (expenseDate < startOfWeek) return false
            break
          case 'month':
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
            if (expenseDate < startOfMonth) return false
            break
        }
      }

      // Amount range filters
      if (filters.minAmount !== undefined && (expense.amount || 0) < filters.minAmount) {
        return false
      }
      if (filters.maxAmount !== undefined && (expense.amount || 0) > filters.maxAmount) {
        return false
      }

      return true
    })
  }, [expenses, filters])

  const updateFilter = <K extends keyof ExpenseFilters>(
    key: K, 
    value: ExpenseFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'all',
      dateRange: 'all'
    })
  }

  // Get unique categories for filter dropdown
  const availableCategories = useMemo(() => {
    const categories = new Set(
      expenses
        .map(expense => expense.category)
        .filter((category): category is string => Boolean(category))
    )
    return Array.from(categories).sort()
  }, [expenses])

  return {
    filters,
    filteredExpenses,
    availableCategories,
    updateFilter,
    clearFilters,
    hasActiveFilters: !!(filters.searchQuery || filters.category !== 'all' || filters.dateRange !== 'all' || 
                      filters.minAmount !== undefined || filters.maxAmount !== undefined)
  }
}