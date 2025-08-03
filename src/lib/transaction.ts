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

export const fetchCustomerTransactions = async (token: string) => {
    const url = `http://localhost:8080/api/transactions`
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

export const fetchArchiveTransaction = async (token: string, request: TransactionRequest, transactionId: number) =>  {
    const url = `http://localhost:8080/api/transactions/${transactionId}`
    const response = await fetch(url, {
        method: "DELETE",
        headers: {'Authorization': `Bearer ${token}`}
    })
    return response
}