import { AccountRequest } from "@/types/AccountRequest"

export const fetchCreateAccount = async (token: string, request: AccountRequest) =>  {
    const url = `http://localhost:8080/api/accounts`
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

export const fetchCustomerAccounts = async (token: string) => {
    const url = `http://localhost:8080/api/accounts`
    const response = await fetch(url, {
        method: "GET",
        headers: {'Authorization': `Bearer ${token}`}
    })
    return response
}