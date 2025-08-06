import { Budget } from "@/types/Budget"
import { BudgetRequest } from "@/types/BudgetRequest"
import { Transaction } from "@/types/Transaction"
import { getCategorySpending } from "./category"

export const fetchCreateBudget = async (token: string, request: BudgetRequest) =>  {
    const url = `http://localhost:8080/api/budgets`
    const response = await fetch(url, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    })
    return response
}

export const fetchCustomerBudgets = async (token: string) => {
    const url = `http://localhost:8080/api/budgets`
    const response = await fetch(url, {
        method: "GET",
        headers: {'Authorization': `Bearer ${token}`}
    })
    return response
}

export const fetchUpdateBudget = async (token: string, budgetId: number, request: BudgetRequest) =>  {
    const url = `http://localhost:8080/api/budgets/${budgetId}`
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    })
    return response
}

export const fetchArchiveBudget = async (token: string, budgetId: number) =>  {
    const url = `http://localhost:8080/api/budgets/${budgetId}`
    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
    return response
}

const getQuarter = (month: number) => Math.floor(month / 3) + 1

export const getBudgetSpending = (budget: Budget, transactions: Transaction[]) => {
    const filteredTransactions = transactions.filter(transaction => {
        const date = new Date(transaction.date)
        const today = new Date()
        if (budget.timePeriod === "MONTH") {
            return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
        }else if (budget.timePeriod === "QUARTER") {
            return date.getFullYear() === today.getFullYear() && getQuarter(date.getMonth()) === getQuarter(today.getMonth())
        } else {
            return date.getFullYear() === today.getFullYear()
        }
    })
    return getCategorySpending(budget.category, filteredTransactions)
}

export const getOverallBudgetData = (budgets: Budget[], transactions: Transaction[]) => {
    let totalLimit = 0
    let totalSpent = 0
    budgets.map(budget => {
        totalLimit += budget.budgetLimit
        totalSpent += getBudgetSpending(budget, transactions)
    })
    const percentage = (totalSpent/totalLimit) * 100
    return {spent: totalSpent, limit: totalLimit, percentage: percentage}
}
