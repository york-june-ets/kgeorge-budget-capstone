import { AccountType } from "./AccountType"

export type AccountRequest = {
    name: string
    type: AccountType | ""
    balance: string
}