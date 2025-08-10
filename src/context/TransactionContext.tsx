'use client'

import { Transaction } from "@/types/Transaction"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { AuthContext } from "./AuthContext"
import { fetchCustomerTransactions } from "@/lib/transaction"
import { AccountContext } from "./AccountContext"

interface TransactionContextValue {
    transactions: Transaction[]
    refresh: () => void
    loadingTransactions: boolean
    transactionError: string
}

export const TransactionContext = createContext<TransactionContextValue>({
    transactions: [],
    refresh: () => {},
    loadingTransactions: false,
    transactionError: ""
})

export const TransactionProvider: React.FC<{children: ReactNode}> = ({children}) => {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true)
    const {token} = useContext(AuthContext)
    const [transactionError, setTransactionError] = useState<string>("")
    const [refreshVal, setRefreshVal] = useState<number>(0)
    const accountContext = useContext(AccountContext)

    useEffect(() => {
        setLoadingTransactions(true)
        const getCustomerTransactions = async () => {
            try {
                if (token) {
                    const response = await fetchCustomerTransactions(token)
                    if (response.ok) {
                        const data = await response.json()
                        setTransactions(data.content)
                    } else {
                        const error = await response.json()
                        setTransactionError(error.message)
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
    }, [refreshVal, token])

    const refresh = () => {
        setRefreshVal(refreshVal + 1)
    }

    return (
        <TransactionContext.Provider value={{transactions, refresh, loadingTransactions, transactionError}}>
            {children}
        </TransactionContext.Provider>
    )
}