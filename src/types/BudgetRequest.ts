import { TimePeriod } from "./TimePeriod"

export type BudgetRequest = {
    category: string
    budgetLimit: string
    timePeriod: TimePeriod | ""
}