import { Allocation } from "./Allocation"
import { RepeatUnit } from "./RepeatUnit"
import { TransactionType } from "./TransactionType"

export type TransactionRequest = {
    accountId: number | null
    description: string
    allocations: Allocation[]
    amount: string
    type: TransactionType | null
    repeatUnit: RepeatUnit | null
    repeatInterval: string
}