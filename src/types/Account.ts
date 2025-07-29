import { AccountType } from "./AccountType"

export type Account = {
    id: number
    customerId: number
    name: string
    type: AccountType
}