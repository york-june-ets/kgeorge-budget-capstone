import { TransactionType } from "./TransactionType"

export type TransactionFilters = {
    dateFrom: string
    dateTo: string
    transactionType: TransactionType | ""
    accountId: number | ""
    categoryId: number | ""
    page: number | ""
}