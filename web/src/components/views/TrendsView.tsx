'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ExpenseItem } from '@/store/api/generated/expenses'

interface TrendsViewProps {
  expenses: ExpenseItem[]
  totals: {
    daily: number
    weekly: number
    monthly: number
    total: number
  }
}

export function TrendsView({ expenses, totals }: TrendsViewProps) {
  const trendData = useMemo(() => {
    if (expenses.length === 0) return null

    // Weekly trends for last 8 weeks
    const weeklyTrends = []
    const now = new Date()
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - (now.getDay() + 7 * i))
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      
      const weekExpenses = expenses.filter(expense => {
        if (!expense.date) return false
        const expenseDate = new Date(expense.date)
        return !isNaN(expenseDate.getTime()) && expenseDate >= weekStart && expenseDate <= weekEnd
      })
      
      const weekTotal = weekExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
      
      weeklyTrends.push({
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        total: weekTotal,
        count: weekExpenses.length,
        isCurrentWeek: i === 0
      })
    }

    // Daily spending pattern (by day of week)
    const dayPatterns = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((dayName, dayIndex) => {
      const dayExpenses = expenses.filter(expense => {
        if (!expense.date) return false
        const expenseDate = new Date(expense.date)
        return !isNaN(expenseDate.getTime()) && expenseDate.getDay() === dayIndex
      })
      
      const dayTotal = dayExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
      const dayAverage = dayExpenses.length > 0 ? dayTotal / Math.ceil(dayExpenses.length / 7) : 0
      
      return {
        day: dayName,
        total: dayTotal,
        average: dayAverage,
        count: dayExpenses.length
      }
    })

    // Category trends
    const categoryTrends: Record<string, { amounts: number[], total: number }> = {}
    
    // Group by week for each category
    weeklyTrends.forEach((_, weekIndex) => {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - (now.getDay() + 7 * (7 - weekIndex)))
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      
      const weekExpenses = expenses.filter(expense => {
        if (!expense.date) return false
        const expenseDate = new Date(expense.date)
        return !isNaN(expenseDate.getTime()) && expenseDate >= weekStart && expenseDate <= weekEnd
      })
      
      weekExpenses.forEach(expense => {
        const category = expense.category || 'Other'
        if (!categoryTrends[category]) {
          categoryTrends[category] = { amounts: new Array(8).fill(0), total: 0 }
        }
        categoryTrends[category].amounts[weekIndex] += expense.amount || 0
        categoryTrends[category].total += expense.amount || 0
      })
    })

    // Calculate spending velocity (trend direction)
    const recentWeeksTotal = weeklyTrends.slice(-4).reduce((sum, week) => sum + week.total, 0)
    const olderWeeksTotal = weeklyTrends.slice(0, 4).reduce((sum, week) => sum + week.total, 0)
    const trendDirection = recentWeeksTotal > olderWeeksTotal ? 'increasing' : recentWeeksTotal < olderWeeksTotal ? 'decreasing' : 'stable'

    return {
      weeklyTrends,
      dayPatterns,
      categoryTrends: Object.entries(categoryTrends)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 5),
      trendDirection,
      averageWeeklySpending: weeklyTrends.reduce((sum, week) => sum + week.total, 0) / weeklyTrends.length
    }
  }, [expenses, totals])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (!trendData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-xl font-semibold mb-2">No Trend Data</h3>
          <p className="text-muted-foreground">Add expenses over time to see trends</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Trend Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {trendData.trendDirection === 'increasing' ? '📈' : 
                 trendData.trendDirection === 'decreasing' ? '📉' : '➡️'}
              </span>
              <div>
                <div className="font-semibold capitalize">{trendData.trendDirection}</div>
                <div className="text-sm text-muted-foreground">vs last month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(trendData.averageWeeklySpending)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Last 8 weeks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.weekly)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Current week spending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Spending Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendData.weeklyTrends.map((week, index) => {
              const maxAmount = Math.max(...trendData.weeklyTrends.map(w => w.total))
              const widthPercentage = maxAmount > 0 ? (week.total / maxAmount) * 100 : 0
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className={week.isCurrentWeek ? 'font-semibold' : ''}>
                      Week of {week.week}
                    </span>
                    <span className="font-medium">{formatCurrency(week.total)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        week.isCurrentWeek ? 'bg-primary' : 'bg-primary/60'
                      }`}
                      style={{ width: `${widthPercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {week.count} transactions
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day of Week Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Day of Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {trendData.dayPatterns.map(day => {
              const maxAverage = Math.max(...trendData.dayPatterns.map(d => d.average))
              const isHighest = day.average === maxAverage && maxAverage > 0
              
              return (
                <div key={day.day} className="text-center space-y-2">
                  <div className="text-sm font-medium">{day.day.slice(0, 3)}</div>
                  <div className={`text-lg font-bold ${isHighest ? 'text-primary' : ''}`}>
                    {formatCurrency(day.average)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {day.count} total expenses
                  </div>
                  {isHighest && (
                    <Badge variant="secondary" className="text-xs">
                      Highest
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Category Trends (8 weeks)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendData.categoryTrends.map(([category, data]) => {
              const trend = data.amounts.slice(-2).reduce((a, b) => a + b, 0) > 
                           data.amounts.slice(0, 2).reduce((a, b) => a + b, 0)
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{category}</Badge>
                      <span className="text-sm">
                        {trend ? '📈' : '📉'}
                      </span>
                    </div>
                    <div className="text-sm font-medium">
                      {formatCurrency(data.total)}
                    </div>
                  </div>
                  
                  {/* Simple trend line */}
                  <div className="flex items-end gap-1 h-8">
                    {data.amounts.map((amount, index) => {
                      const maxInCategory = Math.max(...data.amounts)
                      const height = maxInCategory > 0 ? (amount / maxInCategory) * 100 : 0
                      
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-primary/60 rounded-t"
                          style={{ height: `${Math.max(height, 2)}%` }}
                          title={formatCurrency(amount)}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}