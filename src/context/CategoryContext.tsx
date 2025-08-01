'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { AuthContext } from "./AuthContext"
import { Category } from "@/types/Category"
import { fetchCustomerCategories } from "@/lib/category"

interface CategoryContextValue {
    categories: Category[]
    refresh: () => void
    loadingCategories: boolean
    categoryError: string
}

export const CategoryContext = createContext<CategoryContextValue>({
    categories: [],
    refresh: () => {},
    loadingCategories: false,
    categoryError: ""
})

export const CategoryProvider: React.FC<{children: ReactNode}> = ({children}) => {
    const [categories, setCategories] = useState<Category[]>([])
    const [loadingCategories, setLoadingCategories] = useState<boolean>(true)
    const {token} = useContext(AuthContext)
    const [categoryError, setCategoryError] = useState<string>("")
    const [refreshVal, setRefreshVal] = useState<number>(0)

    useEffect(() => {
        setLoadingCategories(true)
        const getCustomerCategories = async () => {
            try {
                if (token) {
                    const response = await fetchCustomerCategories(token)
                    if (response.ok) {
                        const data = await response.json()
                        console.log(data)
                        setCategories(data)
                    } else {
                        const error = await response.json()
                        setCategoryError(error.message)
                    }
                }
            } catch (err) {
                setCategoryError("An unexpected error occurred")
                console.error(err)
            } finally {
                setLoadingCategories(false)
            }
        }
        getCustomerCategories()
    }, [refreshVal, token])

    const refresh = () => {
        setRefreshVal(refreshVal + 1)
    }

    return (
        <CategoryContext.Provider value={{categories, refresh, loadingCategories, categoryError}}>
            {children}
        </CategoryContext.Provider>
    )
}