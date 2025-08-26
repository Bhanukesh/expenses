'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ExpenseItem } from '@/store/api/generated/expenses'

interface CalendarViewProps {
  expenses: ExpenseItem[]
  onDeleteExpense: (id: number) => Promise<void>
}

export function CalendarView({ expenses, onDeleteExpense }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const { calendarData, monthExpenses } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Get first day of month and last day
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startCalendar = new Date(firstDay)
    startCalendar.setDate(firstDay.getDate() - firstDay.getDay()) // Go to Sunday

    // Filter expenses for current month
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date!)
      return expenseDate.getMonth() === month && expenseDate.getFullYear() === year
    })

    // Group expenses by date
    const expensesByDate: Record<string, ExpenseItem[]> = {}
    monthExpenses.forEach(expense => {
      const dateKey = new Date(expense.date!).toDateString()
      if (!expensesByDate[dateKey]) {
        expensesByDate[dateKey] = []
      }
      expensesByDate[dateKey].push(expense)
    })

    // Generate calendar days (42 days for 6 weeks)
    const calendarDays = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startCalendar)
      date.setDate(startCalendar.getDate() + i)
      
      const dateKey = date.toDateString()
      const dayExpenses = expensesByDate[dateKey] || []
      const dayTotal = dayExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
      
      calendarDays.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === new Date().toDateString(),
        expenses: dayExpenses,
        total: dayTotal
      })
    }

    return {
      calendarData: calendarDays,
      monthExpenses
    }
  }, [currentDate, expenses])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const monthTotal = monthExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {monthExpenses.length} transactions • {formatCurrency(monthTotal)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                ←
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                →
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarData.map((day, index) => (
              <div
                key={index}
                className={`min-h-[100px] p-2 border rounded-lg ${
                  !day.isCurrentMonth 
                    ? 'bg-muted/50 text-muted-foreground' 
                    : day.isToday 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-card hover:bg-muted/50'
                } transition-colors`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${day.isToday ? 'font-bold' : ''}`}>
                    {day.date.getDate()}
                  </span>
                  {day.total > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {formatCurrency(day.total)}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  {day.expenses.slice(0, 2).map(expense => (
                    <div
                      key={expense.id}
                      className="text-xs bg-background rounded p-1 border cursor-pointer hover:bg-muted/50"
                      onClick={() => onDeleteExpense(expense.id!)}
                      title={`${expense.description} - Click to delete`}
                    >
                      <div className="truncate font-medium">
                        {expense.description}
                      </div>
                      <div className="text-muted-foreground">
                        {formatCurrency(expense.amount || 0)}
                      </div>
                    </div>
                  ))}
                  {day.expenses.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{day.expenses.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses for Selected Month */}
      {monthExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Expenses This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {monthExpenses
                .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
                .map(expense => (
                  <div key={expense.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{expense.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {expense.date ? new Date(expense.date).toLocaleDateString() : 'No date'} • {expense.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {formatCurrency(expense.amount || 0)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteExpense(expense.id!)}
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}