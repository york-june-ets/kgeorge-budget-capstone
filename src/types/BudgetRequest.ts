import { TimePeriod } from "./TimePeriod"

export type BudgetRequest = {
    category: string
    limit: string
    timePeriod: TimePeriod | ""
}