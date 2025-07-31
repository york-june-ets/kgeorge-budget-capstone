import { BudgetRequest } from "@/types/BudgetRequest"

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