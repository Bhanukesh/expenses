'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Loader2 } from 'lucide-react'

interface ExpenseInputProps {
  onCreateExpense: (rawText: string) => Promise<void>
  isCreating: boolean
}

export function ExpenseInput({ onCreateExpense, isCreating }: ExpenseInputProps) {
  const [rawText, setRawText] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rawText.trim() || isCreating) return

    try {
      await onCreateExpense(rawText.trim())
      setRawText('')
    } catch {
      // Error is handled by the hook
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as React.FormEvent)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Pizza $12.50"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isCreating}
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={!rawText.trim() || isCreating}
          size="icon"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Type naturally: &quot;Coffee 4.50&quot;, &quot;$15 lunch&quot;, &quot;Gas station 25&quot;
      </p>
    </div>
  )
}