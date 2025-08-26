import { z } from 'zod'

// Base expense schema for creation
export const createExpenseSchema = z.object({
  rawText: z.string()
    .min(1, 'Please enter an expense description')
    .max(1000, 'Description is too long')
    .transform((text) => text.trim())
})

// Enhanced expense schema for updates with better validation
export const updateExpenseSchema = z.object({
  id: z.number().int().positive('Invalid expense ID'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description is too long')
    .transform((text) => text.trim())
    .refine((desc) => {
      // Ensure meaningful description
      return desc.length >= 2 && /[a-zA-Z]/.test(desc)
    }, 'Description must contain at least 2 characters including letters'),
  amount: z.number()
    .positive('Amount must be greater than 0')
    .max(999999.99, 'Amount is too large')
    .refine((amount) => {
      // Check for reasonable decimal places
      return Number.isInteger(amount * 100)
    }, 'Amount can have at most 2 decimal places')
    .transform((amount) => Math.round(amount * 100) / 100),
  category: z.string()
    .min(1, 'Category is required')
    .refine((cat) => {
      const validCategories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Education', 'Other']
      return validCategories.includes(cat)
    }, 'Invalid category selected'),
  subcategory: z.string()
    .max(100, 'Subcategory name is too long')
    .optional()
    .nullable(),
  date: z.date()
    .refine((date) => {
      // Ensure date is not too far in the future (max 1 day ahead)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(23, 59, 59, 999)
      return date <= tomorrow
    }, 'Date cannot be more than 1 day in the future')
    .refine((date) => {
      // Ensure date is not too far in the past (max 2 years)
      const twoYearsAgo = new Date()
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
      return date >= twoYearsAgo
    }, 'Date cannot be more than 2 years in the past')
    .optional()
    .nullable(),
  tags: z.array(z.string().trim().min(1).max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .nullable(),
  notes: z.string()
    .max(1000, 'Notes are too long (max 1000 characters)')
    .transform((text) => text.trim())
    .optional()
    .nullable(),
  isRecurring: z.boolean().optional().nullable(),
  location: z.string()
    .max(200, 'Location name is too long')
    .transform((text) => text.trim())
    .optional()
    .nullable(),
  paymentMethod: z.string()
    .max(50, 'Payment method name is too long')
    .transform((text) => text.trim())
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

// Enhanced validation for natural language expense input
export const naturalExpenseInputSchema = z.object({
  input: z.string()
    .min(1, 'Please enter an expense')
    .max(1000, 'Input is too long')
    .transform((input) => input.trim())
    .refine((input) => {
      // Should contain at least some alphanumeric characters
      return /[a-zA-Z0-9]/.test(input)
    }, 'Please enter a valid expense description')
    .refine((input) => {
      // Check for potential amount patterns or sufficient description
      const hasAmount = /\$?\d+\.?\d*|\d+\.?\d*\$?/.test(input)
      const hasGoodDescription = input.length > 3 && /[a-zA-Z]/.test(input)
      return hasAmount || hasGoodDescription
    }, 'Please include an amount or provide a detailed description')
    .refine((input) => {
      // Reject obvious spam or invalid inputs
      const spamPatterns = /^[\s\W]*$|^(..)\1{3,}|test|placeholder/i
      return !spamPatterns.test(input)
    }, 'Please enter a meaningful expense description')
})

// Enhanced categories validation with subcategories
export const expenseCategoriesSchema = z.enum([
  'Food',
  'Transport',
  'Entertainment', 
  'Shopping',
  'Health',
  'Education',
  'Other'
] as const)

// Subcategories mapping
export const expenseSubcategoriesSchema = z.object({
  Food: z.enum(['Restaurant', 'Groceries', 'Coffee', 'Takeout', 'Other']).optional(),
  Transport: z.enum(['Gas', 'Public Transit', 'Taxi/Uber', 'Parking', 'Other']).optional(),
  Entertainment: z.enum(['Movies', 'Games', 'Sports', 'Music', 'Other']).optional(),
  Shopping: z.enum(['Clothing', 'Electronics', 'Home', 'Books', 'Other']).optional(),
  Health: z.enum(['Medicine', 'Doctor', 'Gym', 'Insurance', 'Other']).optional(),
  Education: z.enum(['Books', 'Courses', 'Supplies', 'Tuition', 'Other']).optional(),
  Other: z.enum(['Miscellaneous']).optional(),
}).partial()

// Type exports for use throughout the app
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
export type ExpenseFiltersInput = z.infer<typeof expenseFiltersSchema>
export type NaturalExpenseInput = z.infer<typeof naturalExpenseInputSchema>
export type ExpenseCategory = z.infer<typeof expenseCategoriesSchema>
export type ExpenseSubcategories = z.infer<typeof expenseSubcategoriesSchema>

// Validation helpers
export const validateExpenseAmount = (amount: string | number): boolean => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return !isNaN(numAmount) && numAmount > 0 && numAmount <= 999999.99 && Number.isInteger(numAmount * 100)
}

export const validateExpenseDescription = (description: string): boolean => {
  const trimmed = description.trim()
  return trimmed.length >= 2 && trimmed.length <= 500 && /[a-zA-Z]/.test(trimmed)
}

// Additional validation helpers
export const validateExpenseCategory = (category: string): boolean => {
  const validCategories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Education', 'Other']
  return validCategories.includes(category)
}

export const validateExpenseDate = (date: Date): boolean => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(23, 59, 59, 999)
  
  const twoYearsAgo = new Date(now)
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
  
  return date >= twoYearsAgo && date <= tomorrow
}

export const sanitizeExpenseInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ')
}

// Enhanced validation for filters - recreate instead of extending due to refinements
export const enhancedExpenseFiltersSchema = z.object({
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
    .optional(),
  view: z.enum(['kanban', 'analytics', 'calendar', 'trends']).optional(),
  sortBy: z.enum(['date', 'amount', 'category', 'description']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
}).refine((data) => {
  // If both dates are provided, fromDate should be before toDate
  if (data.fromDate && data.toDate) {
    return data.fromDate <= data.toDate
  }
  return true
}, {
  message: 'From date must be before or equal to to date',
  path: ['fromDate']
}).refine((data) => {
  // Custom validation rules - max 1 year range
  if (data.fromDate && data.toDate) {
    const daysDiff = Math.abs(data.toDate.getTime() - data.fromDate.getTime()) / (1000 * 60 * 60 * 24)
    if (daysDiff > 365) {
      return false // Max 1 year range
    }
  }
  return true
}, {
  message: 'Date range cannot exceed 1 year',
  path: ['fromDate']
})

// Validation for expense analytics requests
export const expenseAnalyticsSchema = z.object({
  timeframe: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  groupBy: z.enum(['category', 'day', 'week', 'month']).default('category'),
  includeSubcategories: z.boolean().default(false),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
}).refine((data) => {
  if (data.minAmount !== undefined && data.maxAmount !== undefined) {
    return data.minAmount <= data.maxAmount
  }
  return true
}, {
  message: 'Minimum amount must be less than or equal to maximum amount',
  path: ['minAmount']
})

// Type exports for enhanced schemas
export type EnhancedExpenseFiltersInput = z.infer<typeof enhancedExpenseFiltersSchema>
export type ExpenseAnalyticsInput = z.infer<typeof expenseAnalyticsSchema>

// Validation helper functions
export const validateCurrency = (value: string): boolean => {
  const cleanValue = value.replace(/[$,\s]/g, '')
  const numValue = parseFloat(cleanValue)
  return !isNaN(numValue) && numValue >= 0 && numValue <= 999999.99
}

export const validateDateRange = (fromDate?: Date, toDate?: Date): boolean => {
  if (!fromDate || !toDate) return true
  const daysDiff = Math.abs(toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
  return daysDiff <= 365
}

export const sanitizeAndValidateAmount = (input: string): number => {
  const sanitized = input.replace(/[$,\s]/g, '')
  const amount = parseFloat(sanitized)
  if (isNaN(amount) || amount < 0) {
    throw new Error('Invalid amount')
  }
  if (amount > 999999.99) {
    throw new Error('Amount exceeds maximum limit')
  }
  return Math.round(amount * 100) / 100 // Round to 2 decimal places
}