import { TimePeriod } from "./TimePeriod"

export type Budget = {
    id: number
    category: string
    limit: number
    timePeriod: TimePeriod
    enabled: boolean
}