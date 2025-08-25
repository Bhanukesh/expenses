/* eslint-disable -- Auto Generated File */
import { emptySplitApi as api } from "../empty-api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getExpenses: build.query<GetExpensesApiResponse, GetExpensesApiArg>({
      query: (queryArg) => ({
        url: `/api/Expenses`,
        params: {
          category: queryArg.category,
          fromDate: queryArg.fromDate,
          toDate: queryArg.toDate,
          tags: queryArg.tags,
          limit: queryArg.limit,
        },
      }),
    }),
    createExpense: build.mutation<
      CreateExpenseApiResponse,
      CreateExpenseApiArg
    >({
      query: (queryArg) => ({
        url: `/api/Expenses`,
        method: "POST",
        body: queryArg.createExpenseCommand,
      }),
    }),
    getExpenseById: build.query<
      GetExpenseByIdApiResponse,
      GetExpenseByIdApiArg
    >({
      query: (queryArg) => ({ url: `/api/Expenses/${queryArg.id}` }),
    }),
    updateExpense: build.mutation<
      UpdateExpenseApiResponse,
      UpdateExpenseApiArg
    >({
      query: (queryArg) => ({
        url: `/api/Expenses/${queryArg.id}`,
        method: "PUT",
        body: queryArg.updateExpenseCommand,
      }),
    }),
    deleteExpense: build.mutation<
      DeleteExpenseApiResponse,
      DeleteExpenseApiArg
    >({
      query: (queryArg) => ({
        url: `/api/Expenses/${queryArg.id}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as expensesApi };
export type GetExpensesApiResponse = /** status 200  */ ExpenseItem[];
export type GetExpensesApiArg = {
  category?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  tags?: string[] | null;
  limit?: number | null;
};
export type CreateExpenseApiResponse = /** status 200  */ number;
export type CreateExpenseApiArg = {
  createExpenseCommand: CreateExpenseCommand;
};
export type GetExpenseByIdApiResponse = /** status 200  */ ExpenseItem;
export type GetExpenseByIdApiArg = {
  id: number;
};
export type UpdateExpenseApiResponse = unknown;
export type UpdateExpenseApiArg = {
  id: number;
  updateExpenseCommand: UpdateExpenseCommand;
};
export type DeleteExpenseApiResponse = unknown;
export type DeleteExpenseApiArg = {
  id: number;
};
export type ExpenseItem = {
  id?: number;
  description?: string;
  amount?: number;
  category?: string;
  subcategory?: string | null;
  date?: string;
  rawText?: string | null;
  tags?: string[];
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  isRecurring?: boolean;
  location?: string | null;
  paymentMethod?: string | null;
};
export type CreateExpenseCommand = {
  rawText?: string;
};
export type UpdateExpenseCommand = {
  id?: number;
  description?: string;
  amount?: number;
  category?: string;
  subcategory?: string | null;
  date?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  isRecurring?: boolean | null;
  location?: string | null;
  paymentMethod?: string | null;
};
export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useGetExpenseByIdQuery,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = injectedRtkApi;
