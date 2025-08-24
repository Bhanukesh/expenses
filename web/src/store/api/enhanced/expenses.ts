import { expensesApi } from '../generated/expenses'

export const enhancedExpensesApi = expensesApi.injectEndpoints({
  endpoints: (build) => ({
    getExpenses: build.query({
      query: () => ({ url: '/api/Expenses' }),
      providesTags: ['Expense'],
    }),
    createExpense: build.mutation({
      query: (createExpenseCommand) => ({
        url: '/api/Expenses',
        method: 'POST',
        body: createExpenseCommand,
      }),
      invalidatesTags: ['Expense'],
      // Optimistic update
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: newExpenseId } = await queryFulfilled
          
          // We could do optimistic updates here, but since we get back just an ID
          // and need the full expense with categorization, we'll let the invalidation handle it
        } catch {
          // If the mutation fails, the invalidation won't happen
        }
      },
    }),
    deleteExpense: build.mutation({
      query: ({ id }) => ({
        url: `/api/Expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Expense'],
      // Optimistic update for better UX
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          enhancedExpensesApi.util.updateQueryData('getExpenses', undefined, (draft) => {
            const index = draft.findIndex((expense) => expense.id === id)
            if (index !== -1) {
              draft.splice(index, 1)
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
  }),
  overrideExisting: true,
})

export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} = enhancedExpensesApi