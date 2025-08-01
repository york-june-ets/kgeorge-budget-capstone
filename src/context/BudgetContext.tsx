'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { AuthContext } from "./AuthContext"
import { Budget } from "@/types/Budget"
import { fetchCustomerBudgets } from "@/lib/budget"

interface BudgetContextValue {
    budgets: Budget[]
    refresh: () => void
    loadingBudgets: boolean
    budgetError: string
}

export const BudgetContext = createContext<BudgetContextValue>({
    budgets: [],
    refresh: () => {},
    loadingBudgets: false,
    budgetError: ""
})

export const BudgetProvider: React.FC<{children: ReactNode}> = ({children}) => {
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [loadingBudgets, setloadingBudgets] = useState<boolean>(true)
    const {token} = useContext(AuthContext)
    const [budgetError, setBudgetError] = useState<string>("")
    const [refreshVal, setRefreshVal] = useState<number>(0)

    useEffect(() => {
        setloadingBudgets(true)
        const getCustomerBudgets = async () => {
            try {
                if (token) {
                    const response = await fetchCustomerBudgets(token)
                    if (response.ok) {
                        const data = await response.json()
                        console.log(data)
                        setBudgets(data)
                    } else {
                        const error = await response.json()
                        setBudgetError(error.message)
                    }
                }
            } catch (err) {
                setBudgetError("An unexpected error occurred")
                console.error(err)
            } finally {
                setloadingBudgets(false)
            }
        }
        getCustomerBudgets()
    }, [refreshVal, token])

    const refresh = () => {
        setRefreshVal(refreshVal + 1)
    }

    return (
        <BudgetContext.Provider value={{budgets, refresh, loadingBudgets, budgetError}}>
            {children}
        </BudgetContext.Provider>
    )
}