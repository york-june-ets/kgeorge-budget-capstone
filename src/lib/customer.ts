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