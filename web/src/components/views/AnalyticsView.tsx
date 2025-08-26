'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ExpenseItem } from '@/store/api/generated/expenses'

interface AnalyticsViewProps {
  expenses: ExpenseItem[]
  totals: {
    daily: number
    weekly: number
    monthly: number
    total: number
  }
}

export function AnalyticsView({ expenses, totals }: AnalyticsViewProps) {
  const analytics = useMemo(() => {
    if (expenses.length === 0) return null

    // Category breakdown
    const categoryTotals = expenses.reduce((acc, expense) => {
      const category = expense.category || 'Other'
      acc[category] = (acc[category] || 0) + (expense.amount || 0)
      return acc
    }, {} as Record<string, number>)

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    // Monthly trend (last 6 months)
    const now = new Date()
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const monthExpenses = expenses.filter(expense => {
        if (!expense.date) return false
        const expenseDate = new Date(expense.date)
        return !isNaN(expenseDate.getTime()) && expenseDate >= monthDate && expenseDate < nextMonth
      })
      
      monthlyTrend.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        total: monthExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
        count: monthExpenses.length
      })
    }

    // Daily average
    const daysWithExpenses = new Set(expenses
      .filter(expense => expense.date)
      .map(expense => new Date(expense.date!).toDateString())
    ).size
    const avgPerDay = daysWithExpenses > 0 ? totals.total / daysWithExpenses : 0

    return {
      categoryTotals: sortedCategories,
      monthlyTrend,
      avgPerDay,
      totalExpenses: expenses.length,
      highestExpense: Math.max(...expenses.map(e => e.amount || 0)),
      lowestExpense: Math.min(...expenses.map(e => e.amount || 0))
    }
  }, [expenses, totals])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground">Add some expenses to see analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.total)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {analytics.totalExpenses} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.avgPerDay)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Across active days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Highest Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.highestExpense)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.monthly)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.categoryTotals.map(([category, total]) => {
                const percentage = (total / totals.total) * 100
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{category}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(total)}</div>
                      <div className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.monthlyTrend.map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="font-medium">{month.month}</div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(month.total)}</div>
                    <div className="text-sm text-muted-foreground">
                      {month.count} transactions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}