import { CategoryRequest } from "@/types/CategoryRequest"

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