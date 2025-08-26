import { expensesApi } from '../generated/expenses'
import type { UpdateExpenseInput } from '@/lib/validations'
import type { ExpenseItem } from '../generated/expenses'

// Define expense filter interface
interface ExpenseFilters {
  category?: string
  fromDate?: string
  toDate?: string
  tags?: string[]
  limit?: number
}

export const enhancedExpensesApi = expensesApi.injectEndpoints({
  endpoints: (build) => ({
    // Enhanced getExpenses with filtering support
    getExpenses: build.query({
      query: (filters: ExpenseFilters = {}) => {
        const params = new URLSearchParams()
        
        if (filters.category) params.append('category', filters.category)
        if (filters.fromDate) params.append('fromDate', filters.fromDate)
        if (filters.toDate) params.append('toDate', filters.toDate)
        if (filters.tags?.length) {
          filters.tags.forEach(tag => params.append('tags', tag))
        }
        if (filters.limit) params.append('limit', filters.limit.toString())
        
        return {
          url: `/api/Expenses?${params.toString()}`
        }
      },
      providesTags: (result) => 
        result
          ? [
              ...result.map((expense: ExpenseItem) => ({ type: 'Expense' as const, id: expense.id })),
              { type: 'Expense', id: 'LIST' }
            ]
          : [{ type: 'Expense', id: 'LIST' }],
      // Keep cache data for 60 seconds
      keepUnusedDataFor: 60,
    }),

    // Get single expense by ID
    getExpenseById: build.query({
      query: (id: number) => ({
        url: `/api/Expenses/${id}`
      }),
      providesTags: (_result, _error, id) => [{ type: 'Expense', id }],
    }),

    // Create expense with validation
    createExpense: build.mutation({
      query: (rawText: string) => ({
        url: '/api/Expenses',
        method: 'POST',
        body: { rawText },
      }),
      invalidatesTags: [
        { type: 'Expense', id: 'LIST' },
        { type: 'ExpenseSummary', id: 'LIST' },
        { type: 'ExpenseStats', id: 'LIST' }
      ],
      // Optimistic update for immediate UI feedback
      async onQueryStarted(rawText, { dispatch, queryFulfilled }) {
        // Temporarily add a loading state expense
        const tempId = Date.now()
        const optimisticExpense = {
          id: tempId,
          description: rawText,
          amount: 0,
          category: 'Other',
          date: new Date().toISOString(),
          rawText,
          tags: [],
          isLoading: true,
        }

        const patchResult = dispatch(
          enhancedExpensesApi.util.updateQueryData('getExpenses', {}, (draft) => {
            draft.unshift(optimisticExpense as ExpenseItem)
          })
        )

        try {
          await queryFulfilled
        } catch {
          // Revert the optimistic update if the mutation fails
          patchResult.undo()
        }
      },
    }),

    // Update expense
    updateExpense: build.mutation({
      query: ({ id, ...updates }: UpdateExpenseInput) => ({
        url: `/api/Expenses/${id}`,
        method: 'PUT',
        body: { id, ...updates },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Expense', id },
        { type: 'Expense', id: 'LIST' },
        { type: 'ExpenseSummary', id: 'LIST' },
        { type: 'ExpenseStats', id: 'LIST' }
      ],
      // Optimistic update
      async onQueryStarted(updates, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          enhancedExpensesApi.util.updateQueryData('getExpenses', {}, (draft) => {
            const index = draft.findIndex((expense: ExpenseItem) => expense.id === updates.id)
            if (index !== -1) {
              Object.assign(draft[index], updates, { updatedAt: new Date().toISOString() })
            }
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),

    // Delete expense with optimistic updates
    deleteExpense: build.mutation({
      query: (id: number) => ({
        url: `/api/Expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Expense', id },
        { type: 'Expense', id: 'LIST' },
        { type: 'ExpenseSummary', id: 'LIST' },
        { type: 'ExpenseStats', id: 'LIST' }
      ],
      // Optimistic update for immediate UI feedback
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        // Update all relevant queries optimistically
        const patchResults = dispatch(
          enhancedExpensesApi.util.updateQueryData('getExpenses', {}, (draft) => {
            const index = draft.findIndex((expense: ExpenseItem) => expense.id === id)
            if (index !== -1) {
              draft.splice(index, 1)
            }
          })
        )

        try {
          await queryFulfilled
        } catch {
          // Revert all optimistic updates if the mutation fails
          patchResults.undo()
        }
      },
    }),

    // Get expenses grouped by category for dashboard
    getExpenseSummary: build.query({
      query: (filters: ExpenseFilters = {}) => {
        const params = new URLSearchParams()
        if (filters.fromDate) params.append('fromDate', filters.fromDate)
        if (filters.toDate) params.append('toDate', filters.toDate)
        
        return {
          url: `/api/Expenses?${params.toString()}`
        }
      },
      transformResponse: (expenses: ExpenseItem[]) => {
        // Group expenses by category and calculate totals
        const categoryTotals = expenses.reduce((acc, expense) => {
          const category = expense.category || 'Other'
          if (!acc[category]) {
            acc[category] = {
              category,
              total: 0,
              count: 0,
              items: []
            }
          }
          acc[category].total += expense.amount || 0
          acc[category].count += 1
          acc[category].items.push(expense)
          return acc
        }, {} as Record<string, { category: string; total: number; count: number; items: ExpenseItem[] }>)

        return {
          categoryTotals: Object.values(categoryTotals),
          totalAmount: expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
          totalCount: expenses.length,
          recentExpenses: expenses.slice(0, 10)
        }
      },
      providesTags: [
        { type: 'ExpenseSummary', id: 'LIST' },
        { type: 'ExpenseStats', id: 'LIST' }
      ],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseSummaryQuery,
} = enhancedExpensesApi

// Utility hooks for common operations
export const useExpenseOperations = () => {
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation()
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation() 
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation()

  return {
    createExpense,
    updateExpense, 
    deleteExpense,
    isCreating,
    isUpdating,
    isDeleting,
  }
}