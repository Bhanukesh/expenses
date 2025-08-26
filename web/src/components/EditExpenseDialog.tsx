'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { updateExpenseSchema, expenseCategoriesSchema, type UpdateExpenseInput } from '@/lib/validations'
import type { ExpenseItem } from '@/store/api/generated/expenses'

interface EditExpenseDialogProps {
  expense: ExpenseItem | null
  isOpen: boolean
  onClose: () => void
  onSave: (updates: UpdateExpenseInput) => Promise<void>
  isUpdating: boolean
}

const categories = [
  { name: 'Food', icon: '🍕' },
  { name: 'Transport', icon: '🚗' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Health', icon: '⚕️' },
  { name: 'Education', icon: '📚' },
  { name: 'Other', icon: '📦' }
]

export function EditExpenseDialog({ expense, isOpen, onClose, onSave, isUpdating }: EditExpenseDialogProps) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Other',
    date: '',
    notes: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (expense && isOpen) {
      setFormData({
        description: expense.description || '',
        amount: (expense.amount || 0).toString(),
        category: expense.category || 'Other',
        date: expense.date ? new Date(expense.date).toISOString().slice(0, 16) : '',
        notes: expense.notes || ''
      })
      setValidationErrors({})
    }
  }, [expense, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!expense) return

    try {
      // Reset validation errors
      setValidationErrors({})

      // Prepare the update data
      const updateData = {
        id: expense.id!,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category as keyof typeof expenseCategoriesSchema.enum,
        date: formData.date ? new Date(formData.date) : new Date(),
        notes: formData.notes.trim() || null,
        subcategory: null,
        tags: null,
        isRecurring: null,
        location: null,
        paymentMethod: null
      }

      // Validate with Zod
      const validatedData = updateExpenseSchema.parse(updateData)
      
      await onSave(validatedData)
      onClose()
    } catch (error) {
      console.error('Validation error:', error)
      
      if (error && typeof error === 'object' && 'issues' in error) {
        const issues = (error as { issues: Array<{ path: string[]; message: string }> }).issues
        const newErrors: Record<string, string> = {}
        issues.forEach(issue => {
          if (issue.path.length > 0) {
            newErrors[issue.path[0]] = issue.message
          }
        })
        setValidationErrors(newErrors)
      } else {
        setValidationErrors({ general: 'Failed to update expense' })
      }
    }
  }

  const handleClose = () => {
    setValidationErrors({})
    onClose()
  }

  if (!isOpen || !expense) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Edit Expense
            <Button variant="ghost" size="sm" onClick={handleClose}>
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error */}
            {validationErrors.general && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {validationErrors.general}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={validationErrors.description ? 'border-destructive' : ''}
                placeholder="Enter expense description"
              />
              {validationErrors.description && (
                <div className="text-sm text-destructive">{validationErrors.description}</div>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className={validationErrors.amount ? 'border-destructive' : ''}
                placeholder="0.00"
              />
              {validationErrors.amount && (
                <div className="text-sm text-destructive">{validationErrors.amount}</div>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map(category => (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: category.name }))}
                    className={`p-2 rounded-lg border text-sm transition-colors ${
                      formData.category === category.name
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-muted border-border'
                    }`}
                  >
                    <div className="text-lg mb-1">{category.icon}</div>
                    <div>{category.name}</div>
                  </button>
                ))}
              </div>
              {validationErrors.category && (
                <div className="text-sm text-destructive">{validationErrors.category}</div>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date & Time</label>
              <Input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className={validationErrors.date ? 'border-destructive' : ''}
              />
              {validationErrors.date && (
                <div className="text-sm text-destructive">{validationErrors.date}</div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}