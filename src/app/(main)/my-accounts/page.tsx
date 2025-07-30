'use client'

import { AuthContext } from "@/context/AuthContext"
import { fetchCreateAccount, fetchCustomerAccounts } from "@/lib/account"
import styles from "@/styles/my-accounts.module.css"
import { Account } from "@/types/Account"
import { AccountRequest } from "@/types/AccountRequest"
import { AccountType } from "@/types/AccountType"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"

export default function MyAccounts() {
    const [error, setError] = useState<String>("")
    const [loading, setLoading] = useState<boolean>(false)
    const {token, logout} = useContext(AuthContext)
    const [accountRequest, setAccountRequest] = useState<AccountRequest>({name: "", type: "", balance: "0.00"})
    const [accounts, setAccounts] = useState<Account[]>([])
    const [refresh, setRefresh] = useState<number>(0)
    const router = useRouter()

    useEffect(() => {
        setLoading(true)
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
                        setError(error.message)
                    }
                }
            } catch (err) {
                setError("An unexpecetd error occurred")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        getCustomerAccounts()
    }, [refresh, token])

    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setError("")
        const {name, value} = event.target
        if (name === "balance") {
            // Accept: empty string or numbers with up to 2 decimal places
            const regex = /^\d*(\.\d{0,2})?$/
            if (!regex.test(value)) return
        }
        setAccountRequest(prev => ({
            ...prev,
            [name]: value
        }))
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const submitAccountRequest = async () => {
            try {
                if (token) {
                    const response = await fetchCreateAccount(token, accountRequest)
                    if (response.ok) {
                        setRefresh(refresh + 1)
                    } 
                    else {
                        const error = await response.json()
                        setError(error.message)
                    }
                }
            } catch (err) {
                setError("An unexpected error occured")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        submitAccountRequest()
    }

    return (
        <div className="background">
            <div className="book">
                <div className="page-left">
                    <h1 className={styles.title2}>Add a New Account</h1>
                    <div className={styles.formbar}>Please enter your account information below</div>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <input type="text" name="name" placeholder="Account Name*" value={accountRequest.name} onChange={handleChange} disabled={loading} required></input>
                        <select name="type" disabled={loading} onChange={handleChange}>
                            <option value="">Account Type*</option>
                            <option value={AccountType.CHECKING}>CHECKING</option>
                            <option value={AccountType.SAVINGS}>SAVINGS</option>
                            <option value={AccountType.CASH}>CASH</option>
                            <option value={AccountType.OTHER}>OTHER</option>
                        </select>
                        <input type="text" name="balance" placeholder="0.00" value={accountRequest.balance} onChange={handleChange} disabled={loading} required></input>
                        <button className="buttonSecondary" type="submit" disabled={loading}>Create</button>
                        {error && <p>{error}</p>}
                    </form>
                </div>
                <div className="page-right">
                    <h1 className={styles.title}>My Accounts</h1>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr className={styles.tr}>
                                <th className={styles.th}>Name</th>
                                <th className={styles.th}>Type</th>
                                <th className={styles.th}>Balance</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                        {
                            accounts.map(account => (
                                <tr className={styles.tr} key={account.id}>
                                    <td className={styles.td}>{account.name}</td>
                                    <td className={styles.td}>{account.type}</td>
                                    <td className={styles.td}>${account.balance}</td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </div>
            </div>
            <button className="logout" onClick={logout}>logout</button>
        </div>
    )
}