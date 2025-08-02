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