import { AllocationRequest } from "./AllocationRequest"
import { RepeatUnit } from "./RepeatUnit"
import { TransactionType } from "./TransactionType"

export type TransactionRequest = {
    date: string
    accountId: number | null
    description: string
    allocations: AllocationRequest[]
    amount: string
    transactionType: TransactionType | null
    repeatUnit: RepeatUnit | ""
    repeatInterval: string
}