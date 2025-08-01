import { RepeatUnit } from "./RepeatUnit"
import { TransactionType } from "./TransactionType"
import { AllocationRequest } from "./AllocationRequest"

export type Transaction = {
    transactionId: number
    accountId: number
    description: string
    allocations: AllocationRequest[] | null
    amount: string
    type: TransactionType | null
    repeatUnit: RepeatUnit | null
    repeatInterval: string
}