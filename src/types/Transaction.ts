import { RepeatUnit } from "./RepeatUnit"
import { TransactionType } from "./TransactionType"
import { AllocationRequest } from "./AllocationRequest"
import { Account } from "./Account"

export type Transaction = {
    id: number
    account: Account
    description: string
    amount: string
    transactionType: TransactionType
    repeatUnit: RepeatUnit
    repeatInterval: string
}