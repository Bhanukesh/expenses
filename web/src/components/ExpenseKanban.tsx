'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import type { ExpenseItem } from '@/store/api/generated/expenses'

interface ExpenseKanbanProps {
  expenses: ExpenseItem[]
  onDeleteExpense: (id: number) => Promise<void>
  isDeleting: boolean
}

const categoryColors: Record<string, string> = {
  'Food': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'Transport': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Entertainment': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'Shopping': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Health': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'Utilities': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Education': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
}

export function ExpenseKanban({ expenses, onDeleteExpense, isDeleting }: ExpenseKanbanProps) {
  const expensesByCategory = useMemo(() => {
    const grouped = expenses.reduce((acc, expense) => {
      const category = expense.category || 'Other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(expense)
      return acc
    }, {} as Record<string, ExpenseItem[]>)

    // Sort categories by total amount
    return Object.entries(grouped)
      .map(([category, items]) => ({
        category,
        items: items.sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime()),
        total: items.reduce((sum, item) => sum + (item.amount || 0), 0)
      }))
      .sort((a, b) => b.total - a.total)
  }, [expenses])

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No expenses yet. Add your first expense above!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {expensesByCategory.map(({ category, items, total }) => (
        <Card key={category} className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={categoryColors[category] || categoryColors.Other}>
                  {category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <span className="text-sm font-medium">
                {formatAmount(total)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {items.map((expense) => (
                <div
                  key={expense.id}
                  className="p-3 rounded-lg bg-muted/50 group hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {expense.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(expense.date!)}
                      </p>
                      {expense.rawText && expense.rawText !== expense.description && (
                        <p className="text-xs text-muted-foreground italic mt-1 truncate">
                          &quot;{expense.rawText}&quot;
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="font-medium text-sm">
                        {formatAmount(expense.amount || 0)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onDeleteExpense(expense.id!)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}