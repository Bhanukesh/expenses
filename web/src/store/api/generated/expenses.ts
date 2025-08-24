/* eslint-disable -- Auto Generated File */
import { emptySplitApi as api } from "../empty-api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getExpenses: build.query<GetExpensesApiResponse, GetExpensesApiArg>({
      query: () => ({ url: `/api/Expenses` }),
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
export type GetExpensesApiArg = void;
export type CreateExpenseApiResponse = /** status 200  */ number;
export type CreateExpenseApiArg = {
  createExpenseCommand: CreateExpenseCommand;
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
  date?: string;
  rawText?: string | null;
};
export type CreateExpenseCommand = {
  rawText?: string;
};
export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} = injectedRtkApi;
