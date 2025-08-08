import { TransactionFilters } from "@/types/TransactionFilters"
import { TransactionRequest } from "@/types/TransactionRequest"

export const fetchCreateTransaction = async (token: string, request: TransactionRequest) =>  {
    const url = `http://localhost:8080/api/transactions`
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

export const fetchCustomerTransactions = async (token: string, filters?: TransactionFilters) => {
    
    const params = new URLSearchParams()

    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== undefined && value !== null) {
            params.append(key, String(value))
        }
        })
    }
    const url = `http://localhost:8080/api/transactions?${params.toString()}`
    const response = await fetch(url, {
        method: "GET",
        headers: {'Authorization': `Bearer ${token}`}
    })
    return response
}

export const fetchUpdateTransaction = async (token: string, request: TransactionRequest, transactionId: number) =>  {
    const url = `http://localhost:8080/api/transactions/${transactionId}`
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

export const fetchArchiveTransaction = async (token: string, transactionId: number) =>  {
    const url = `http://localhost:8080/api/transactions/${transactionId}`
    const response = await fetch(url, {
        method: "DELETE",
        headers: {'Authorization': `Bearer ${token}`}
    })
    return response
}

export const downloadTransactionCsv = async(token: string, filters?: TransactionFilters) => {
     const params = new URLSearchParams()

    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== "" && value !== undefined && value !== null) {
                params.append(key, String(value))
            }
        })
    }
    const url = `http://localhost:8080/api/transactions?${params.toString()}&t=${Date.now()}`
    const response = await fetch(url, {
        method: "GET",
        headers: {'Authorization': `Bearer ${token}`}
    })
    
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = "transactions.csv"
    link.click()
    link.remove()
}