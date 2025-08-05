import { AllocationRequest } from "@/types/AllocationRequest"
import { Category } from "@/types/Category"
import { CategoryRequest } from "@/types/CategoryRequest"
import { Transaction } from "@/types/Transaction"

export const fetchCreateCategory = async (token: string, request: CategoryRequest) => {
    const url = `http://localhost:8080/api/categories`
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

export const fetchCustomerCategories = async (token: string) => {
    const url = `http://localhost:8080/api/categories`
    const response = await fetch(url, {
        method: "GET",
        headers: {'Authorization': `Bearer ${token}`}
    })
    return response
}

export const fetchUpdateCategory = async (token: string, categoryId: number, request: CategoryRequest) =>  {
    const url = `http://localhost:8080/api/categories/${categoryId}`
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

export const fetchArchiveCategory = async (token: string, categoryId: number) =>  {
    const url = `http://localhost:8080/api/categories/${categoryId}`
    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
    return response
}

export const getCategorySpending = (category: string, transactions: Transaction[]) => {
    let spending = 0;
    transactions.forEach(transaction => {
        const allocations = transaction.allocations
        allocations.forEach(allocation => {
            if (allocation.category === category) {
                spending += +allocation.amount
            }
        })
    })
    return spending
}

export const getTopFiveTotal = (transactions: Transaction[], categories: Category[]) => {
    let total = 0;
    [...categories].sort((a,b) => 
        getCategorySpending(b.name, transactions) - getCategorySpending(a.name, transactions))
        .slice(0,5).map(category => {
            total += getCategorySpending(category.name, transactions)
        }
    )
    return total
}
