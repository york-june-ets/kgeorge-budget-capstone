import { LoginRequest } from "@/types/LoginRequest";
import { SignupRequest } from "@/types/SignupRequest";

export const fetchCreateCustomer = async (request: SignupRequest) => {
    const url = `http://localhost:8080/api/customers`
    const response = await fetch(url, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(request)
    })
    return response
}

export const fetchAuthenticateCustomer = async (request: LoginRequest) => {
    const url = `http://localhost:8080/api/auth/login`
    const response = await fetch(url, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(request)
    })
    return response
}