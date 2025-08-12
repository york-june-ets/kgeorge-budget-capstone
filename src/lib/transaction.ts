import { Transaction } from "@/types/Transaction"
import { TransactionFilters } from "@/types/TransactionFilters"
import { TransactionRequest } from "@/types/TransactionRequest"
import { TransactionType } from "@/types/TransactionType"

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
            if (key === "page") {
                params.append(key, "")
            } else {
                if (value !== "" && value !== undefined && value !== null) {
                    params.append(key, String(value))
                }
            }
        })
    }
    const url = `http://localhost:8080/api/transactions/download/csv?${params.toString()}`
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

export const calculateSpendingCoordinates = async (token: string, width: string) => {
    const year = new Date().getFullYear()
    const yearStart = new Date(year, 0, 1).toString()
    const yearEnd = new Date(year, 11, 31).toString()

    const filters: TransactionFilters = {dateTo: yearEnd, dateFrom: yearStart, transactionType: "", accountId: "", categoryId: "", page: ""}
    const response = await fetchCustomerTransactions(token, filters)

    if (!response.ok) {return ""}
    const data = await response.json()
    const transactions: Transaction[] = data.content

    let annualTotal: number = 0;
    const monthlySpending: number[] = [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]
    transactions.forEach(transaction => {
        if (transaction.transactionType === "WITHDRAWAL") {
            const month: number = new Date(transaction.date).getMonth()
            const amount: number = Number(Number(transaction.amount).toFixed(2))

            monthlySpending[month] += amount
            annualTotal += amount
        }
    })

    const percentages = monthlySpending.map(monthTotal => (monthTotal / annualTotal) * 100)
    
    let coordinates = ""
    for (let i = 0; i < 12; i++) {
        const x = (Number(width) / 12) * i
        coordinates += x.toFixed(2)+ ", " + percentages[i].toFixed(2)
        if (i != 11) {coordinates += ", "}
    }
    
    return coordinates
}