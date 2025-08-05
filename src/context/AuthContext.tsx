'use client'

import { fetchEndSession } from "@/lib/auth"
import { Customer } from "@/types/Customer"
import { createContext, ReactNode, useEffect, useState } from "react"

interface AuthContextValue {
    currentCustomer: Customer | null
    token: string | null
    login: (userToken: string | null, customerInfo: Customer | null) => void
    logout: () => void
    updateSession: (userToken: string | null, customerInfo: Customer | null) => void
    loading: boolean
}

export const AuthContext = createContext<AuthContextValue>({
    currentCustomer: null,
    token: null,
    login: () => {},
    logout: () => {},
    updateSession: () => {},
    loading: false
})

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
    const [token, setToken] = useState<string | null>(null)
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const existingToken = localStorage.getItem('authToken')
        const existingCustomer = localStorage.getItem('currentCustomer')

        if (existingToken) {setToken(existingToken)}
        if (existingCustomer) {setCurrentCustomer(JSON.parse(existingCustomer))}
        setLoading(false)
    },[])

    useEffect(() => {
        if (!token) return

        const timeout = setTimeout(() => {
            logout()
        }, 30 * 60 * 1000)

        return () => clearTimeout(timeout)
    }, [token])

    const updateSession = (customerToken: string | null, customerInfo: Customer| null) => {
        if (customerToken && customerInfo) {
            setToken(customerToken)
            setCurrentCustomer(customerInfo)
            window.localStorage.setItem('authToken', customerToken)
            window.localStorage.setItem('currentCustomer', JSON.stringify(customerInfo))
            window.location.href="/edit-profile"
        }
    }

    const login = (customerToken: string | null, customerInfo: Customer | null) => {
        if (customerToken && customerInfo) {
            setToken(customerToken)
            setCurrentCustomer(customerInfo)
            window.localStorage.setItem('authToken', customerToken)
            window.localStorage.setItem('currentCustomer', JSON.stringify(customerInfo))
            window.location.href="/"
        }
    }

    const logout = () => {
        if (token) {fetchEndSession(token)}
        window.localStorage.removeItem('authToken')
        window.localStorage.removeItem('currentCustomer')
        setToken(null)
        setCurrentCustomer(null)
        window.location.href="/login"
    }

    return (
        <AuthContext.Provider value={{currentCustomer, token, login, logout, updateSession, loading}}>
            {children}
        </AuthContext.Provider>
    )
}