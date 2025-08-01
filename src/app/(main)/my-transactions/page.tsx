'use client'

import { AuthContext } from "@/context/AuthContext"
import { Category } from "@/types/Category"
import { Transaction } from "@/types/Transaction"
import { TransactionRequest } from "@/types/TransactionRequest"
import { useRouter } from "next/navigation"
import { useContext, useState } from "react"
import styles from "@/styles/my-transactions.module.css"

export default function MyTransactions() {
    const [error, setError] = useState<String>("")
    const [loading, setLoading] = useState<boolean>(false)
    const {token, logout} = useContext(AuthContext)
    const [transactionRequest, setTransactionRequest] = useState<TransactionRequest>({
        accountId: null,
        description: "",
        allocations: [],
        amount: "",
        type: null, 
        repeatUnit: null, 
        repeatInterval: "" 
    })
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [refresh, setRefresh] = useState<number>(0)
    const router = useRouter()
    const [edit, setEdit] = useState<boolean>(false)
    const [transactionId, setTransactionId] = useState<number | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [withdrawal, setWithdrawal] = useState<boolean>(false)

    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setError("")
        const {name, value} = event.target
        if (name === "amount") {
            // Accept: empty string or numbers with up to 2 decimal places
            const regex = /^\d*(\.\d{0,2})?$/
            if (!regex.test(value)) return
        }
        setTransactionRequest(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <div className="background">
            <div className="book">
                <div className="page-left"></div>
                <div className="page-right">
                    <div className="page-header">
                        <h1 className={styles.title}>Transaction Management</h1>
                    </div>
                    {!edit &&
                        <>
                            <h2 className="subtitle">ADD NEW TRANSACTION</h2>
                            <form className={styles.form}>
                                <input className={styles.description} type="text" name="description" placeholder="Decription*" value={transactionRequest.description} onChange={handleChange} disabled={loading} required></input>
                                <div className={styles.row}>
                                    <button className={styles.submit} type="submit" disabled={loading}>Create</button>
                                </div>
                                {error && <p>{error}</p>}
                            </form>
                        </>
                    }
                    <h2 className="subtitle">VIEW TRANSACTIONS</h2>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr className={styles.tr}>
                                    
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                            {
                                transactions.map(transaction => (
                                    <tr className={styles.tr} key={transaction.id}>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <button className="toc" onClick={() => router.push('/table-of-contents')}>Table of Contents</button>
            <button className="logout" onClick={logout}>Logout</button>
        </div>
    )
}