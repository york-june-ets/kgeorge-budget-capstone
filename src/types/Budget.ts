import { TimePeriod } from "./TimePeriod"

export type Budget = {
    id: number
    category: string
    budgetLimit: number
    timePeriod: TimePeriod
}