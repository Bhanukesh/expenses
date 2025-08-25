import { z } from 'zod'

// Base expense schema for creation
export const createExpenseSchema = z.object({
  rawText: z.string()
    .min(1, 'Please enter an expense description')
    .max(1000, 'Description is too long')
    .transform((text) => text.trim())
})

// Full expense schema for updates
export const updateExpenseSchema = z.object({
  id: z.number().int().positive(),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description is too long')
    .transform((text) => text.trim()),
  amount: z.number()
    .positive('Amount must be greater than 0')
    .max(999999.99, 'Amount is too large')
    .transform((amount) => Math.round(amount * 100) / 100), // Round to 2 decimal places
  category: z.string()
    .min(1, 'Category is required')
    .max(100, 'Category name is too long'),
  subcategory: z.string()
    .max(100, 'Subcategory name is too long')
    .optional()
    .nullable(),
  date: z.date()
    .optional()
    .nullable(),
  tags: z.array(z.string().max(50))
    .max(20, 'Too many tags')
    .optional()
    .nullable(),
  notes: z.string()
    .max(2000, 'Notes are too long')
    .optional()
    .nullable(),
  isRecurring: z.boolean().optional().nullable(),
  location: z.string()
    .max(200, 'Location name is too long')
    .optional()
    .nullable(),
  paymentMethod: z.string()
    .max(50, 'Payment method name is too long')
    .optional()
    .nullable()
})

// Schema for expense filters/queries
export const expenseFiltersSchema = z.object({
  category: z.string()
    .max(100)
    .optional(),
  fromDate: z.date()
    .optional(),
  toDate: z.date()
    .optional(),
  tags: z.array(z.string().max(50))
    .max(10)
    .optional(),
  limit: z.number()
    .int()
    .positive()
    .max(1000)
    .optional()
}).refine((data) => {
  // If both dates are provided, fromDate should be before toDate
  if (data.fromDate && data.toDate) {
    return data.fromDate <= data.toDate
  }
  return true
}, {
  message: 'From date must be before or equal to to date',
  path: ['fromDate']
})

// Validation for natural language expense input
export const naturalExpenseInputSchema = z.object({
  input: z.string()
    .min(1, 'Please enter an expense')
    .max(1000, 'Input is too long')
    .refine((input) => {
      // Should contain at least some alphanumeric characters
      return /[a-zA-Z0-9]/.test(input)
    }, 'Please enter a valid expense description')
    .refine((input) => {
      // Optional: Check for potential amount patterns
      const hasAmount = /\$?\d+\.?\d*|\d+\.?\d*\$?/.test(input)
      return hasAmount || input.length > 3 // Either has amount or is descriptive enough
    }, 'Please include an amount or more details')
})

// Categories validation
export const expenseCategoriesSchema = z.enum([
  'Food',
  'Transport',
  'Entertainment', 
  'Shopping',
  'Health',
  'Education',
  'Other'
] as const)

// Type exports for use throughout the app
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
export type ExpenseFiltersInput = z.infer<typeof expenseFiltersSchema>
export type NaturalExpenseInput = z.infer<typeof naturalExpenseInputSchema>
export type ExpenseCategory = z.infer<typeof expenseCategoriesSchema>

// Validation helpers
export const validateExpenseAmount = (amount: string | number): boolean => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return !isNaN(numAmount) && numAmount > 0 && numAmount <= 999999.99
}

export const validateExpenseDescription = (description: string): boolean => {
  return description.trim().length > 0 && description.length <= 500
}

export const sanitizeExpenseInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ')
}