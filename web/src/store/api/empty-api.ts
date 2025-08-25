import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const apiUrl = process.env.NEXT_PUBLIC_DOTNET_API_URL || 'http://localhost:5518'

export const emptySplitApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: apiUrl,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Expense', 'ExpenseSummary', 'ExpenseCategory', 'ExpenseStats'],
  endpoints: () => ({}),
})

export const { reducer, reducerPath } = emptySplitApi;
