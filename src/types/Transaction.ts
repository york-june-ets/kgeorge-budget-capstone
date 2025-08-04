import { RepeatUnit } from "./RepeatUnit"
import { TransactionType } from "./TransactionType"
import { AllocationRequest } from "./AllocationRequest"
import { Account } from "./Account"
import { Allocation } from "./Allocation"

export type Transaction = {
    id: number
    date: string
    account: Account
    description: string
    amount: string
    transactionType: TransactionType
    repeatUnit: RepeatUnit
    repeatInterval: string
    allocations: Allocation[]
}