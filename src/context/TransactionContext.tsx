'use client'

import { Transaction } from "@/types/Transaction"
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react"
import { AuthContext } from "./AuthContext"
import { fetchCustomerTransactions } from "@/lib/transaction"
import { AccountContext } from "./AccountContext"
import { TransactionFilters } from "@/types/TransactionFilters"

interface TransactionContextValue {
    transactions: Transaction[]
    refresh: () => void
    loadingTransactions: boolean
    transactionError: string
    totalPages: number
    setTransactionFilters: Dispatch<SetStateAction<TransactionFilters>>
    transactionFilters: TransactionFilters
}

export const TransactionContext = createContext<TransactionContextValue>({
    transactions: [],
    refresh: () => {},
    loadingTransactions: false,
    transactionError: "",
    totalPages: 0,
    setTransactionFilters: () => {},
    transactionFilters: {dateFrom: "", dateTo: "", transactionType: "", accountId: "", categoryId: "", page: 0}
})

export const TransactionProvider: React.FC<{children: ReactNode}> = ({children}) => {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true)
    const {token} = useContext(AuthContext)
    const [transactionError, setTransactionError] = useState<string>("")
    const [refreshVal, setRefreshVal] = useState<number>(0)
    const accountContext = useContext(AccountContext)
    const [totalPages, setTotalPages] = useState<number>(0)
    const [transactionFilters, setTransactionFilters] = useState<TransactionFilters>({dateFrom: "", dateTo: "", transactionType: "", accountId: "", categoryId: "", page: 0})

    useEffect(() => {
        setLoadingTransactions(true)
        const getCustomerTransactions = async () => {
            try {
                if (token) {
                    const response = await fetchCustomerTransactions(token, transactionFilters)
                    if (response.ok) {
                        const data = await response.json()
                        setTransactions(data.content)
                        setTotalPages(data.totalPages)
                    } else {
                        const error = await response.json()
                        setTransactionError("Error loading transactions")
                        console.error(error.message)
                    }
                }
            } catch (err) {
                setTransactionError("An unexpected error occurred")
                console.error(err)
            } finally {
                setLoadingTransactions(false)
            }
        }
        getCustomerTransactions()
        accountContext.refresh()
    }, [refreshVal, token, transactionFilters])

    const refresh = () => {
        setRefreshVal(refreshVal + 1)
    }

    return (
        <TransactionContext.Provider value={{transactions, transactionFilters, setTransactionFilters, totalPages, refresh, loadingTransactions, transactionError}}>
            {children}
        </TransactionContext.Provider>
    )
}