'use client'

import { fetchCustomerAccounts } from "@/lib/account"
import { Account } from "@/types/Account"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { AuthContext } from "./AuthContext"

interface AccountContextValue {
    accounts: Account[]
    refresh: () => void
    loadingAccounts: boolean
    accountError: string
}

export const AccountContext = createContext<AccountContextValue>({
    accounts: [],
    refresh: () => {},
    loadingAccounts: false,
    accountError: ""
})

export const AccountProvider: React.FC<{children: ReactNode}> = ({children}) => {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true)
    const {token} = useContext(AuthContext)
    const [accountError, setAccountError] = useState<string>("")
    const [refreshVal, setRefreshVal] = useState<number>(0)

    useEffect(() => {
        setLoadingAccounts(true)
        const getCustomerAccounts = async () => {
            try {
                if (token) {
                    const response = await fetchCustomerAccounts(token)
                    if (response.ok) {
                        const data = await response.json()
                        console.log(data)
                        setAccounts(data)
                    } else {
                        const error = await response.json()
                        setAccountError(error.message)
                    }
                }
            } catch (err) {
                setAccountError("An unexpected error occurred")
                console.error(err)
            } finally {
                setLoadingAccounts(false)
            }
        }
        getCustomerAccounts()
    }, [refreshVal, token])

    const refresh = () => {
        setRefreshVal(refreshVal + 1)
    }

    return (
        <AccountContext.Provider value={{accounts, refresh, loadingAccounts, accountError}}>
            {children}
        </AccountContext.Provider>
    )
}