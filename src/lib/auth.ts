import { LoginRequest } from "@/types/LoginRequest"

export const fetchAuthenticateCustomer = async (request: LoginRequest) => {
    const url = `http://localhost:8080/api/auth/login`
    const response = await fetch(url, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(request)
    })
    return response
}

export const fetchEndSession = async (token: string) => {
    const url = `http://localhost:8080/api/auth/logout`
    const response = await fetch(url, {
        method: "DELETE",
        headers: {'Authorization': `Bearer ${token}`}
    })
}
