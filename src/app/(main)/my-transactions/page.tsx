'use client'

import { AuthContext } from "@/context/AuthContext"
import { Category } from "@/types/Category"
import { Transaction } from "@/types/Transaction"
import { TransactionRequest } from "@/types/TransactionRequest"
import { useRouter } from "next/navigation"
import { useContext, useState } from "react"
import styles from "@/styles/my-transactions.module.css"
import { AccountContext } from "@/context/AccountContext"
import { TransactionType } from "@/types/TransactionType"
import { RepeatUnit } from "@/types/RepeatUnit"
import { CategoryContext } from "@/context/CategoryContext"
import { fetchCreateTransaction } from "@/lib/transaction"

export default function MyTransactions() {
    const [error, setError] = useState<String>("")
    const [loading, setLoading] = useState<boolean>(false)
    const {token, logout} = useContext(AuthContext)
    const [transactionRequest, setTransactionRequest] = useState<TransactionRequest>({
        accountId: null,
        description: "",
        allocations: [],
        amount: "",
        transactionType: null, 
        repeatUnit: "", 
        repeatInterval: "" 
    })
    const [refresh, setRefresh] = useState<number>(0)
    const router = useRouter()
    const [edit, setEdit] = useState<boolean>(false)
    const [transactionId, setTransactionId] = useState<number | null>(null)
    const [withdrawal, setWithdrawal] = useState<boolean>(false)
    const {accounts, loadingAccounts} = useContext(AccountContext)
    const {categories, loadingCategories} = useContext(CategoryContext)

    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setError("")
        const {name, value} = event.target
        if (name === "repeatInterval") {
            // Accept: empty string or numbers (ints)
            const regex = /^\d*$/
            if (!regex.test(value)) return 
        }
        if (name === "transactionType") {
            if (value === "WITHDRAWAL") {setWithdrawal(true)}
            else {setWithdrawal(false)}
        }
        setTransactionRequest(prev => ({
            ...prev,
            [name]: value
        }))
    }

    function handleAllocationChange(index: number, name: "category" | "amount", value: string) {
        if (name === "amount") {
            // Accept: numbers with up to 2 decimal places
            const regex = /^\d*(\.\d{0,2})?$/
            if (!regex.test(value)) return
        }
        const updatedAllocations = [...transactionRequest.allocations]
        updatedAllocations[index] = {
            ...updatedAllocations[index],
            [name]: value
        }

        setTransactionRequest(prev => {
            let updated = {
                ...prev, 
                allocations: updatedAllocations,
            }

            if (withdrawal) {
                let total = 0
                for (let i = 0; i < updatedAllocations.length; i++) {
                    const allocation = updatedAllocations[i]
                    const amount = allocation.amount ? parseFloat(allocation.amount) : 0
                    total += amount
                }
                updated = {
                    ...prev, 
                    allocations: updatedAllocations,
                    amount: total.toFixed(2)
                }
            }
            return updated
        })
    }

    function handleAddAllocation() {
        setTransactionRequest(prev => ({
            ...prev,
            allocations: [...prev.allocations, { category: "", amount: "" }]
        }))
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
            event.preventDefault()
            setLoading(true)
            const submitAccountRequest = async () => {
                try {
                    if (token) {
                        const response = await fetchCreateTransaction(token, transactionRequest)
                        if (response.ok) {
                            // refresh()
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
                <div className="page-left"></div>
                <div className="page-right">
                    <div className="page-header">
                        <h1 className={styles.title}>Transaction Management</h1>
                    </div>
                    {!edit &&
                        <>
                            <h2 className="subtitle">ADD NEW TRANSACTION</h2>
                            <form className={styles.form} onSubmit={handleSubmit}>
                                {withdrawal && 
                                    <div className={styles.formLeft}>
                                        {transactionRequest.allocations.map((allocation, index) => (
                                            <div key={index} className={styles.allocationRow}>
                                                <select name={`allocation-category-${index}`} value={allocation.category} onChange={(e) => handleAllocationChange(index, "category", e.target.value)}disabled={loadingCategories || loading}>
                                                    <option value="">Category*</option>
                                                    {
                                                        categories.map((category) => (
                                                            <option key={category.id} value={category.name}>{category.name}</option>
                                                        ))
                                                    }
                                                </select>
                                                <input type="text" name={`allocation-amount-${index}`} placeholder="0.00" value={allocation.amount} onChange={(e) => handleAllocationChange(index, "amount", e.target.value)}disabled={loading} required/>
                                            </div>
                                        ))}
                                        <button type="button" className={styles.addButton} onClick={handleAddAllocation}>+</button>
                                    </div>
                                }
                                <div className={styles.formRight}>
                                    <input className={styles.description} type="text" name="description" placeholder="Decription*" value={transactionRequest.description} onChange={handleChange} disabled={loading} required></input>
                                    <div className={styles.grid}>
                                        <select className={styles.account} name="accountId" disabled={loadingAccounts || loading} onChange={handleChange}>
                                            <option value="">Account*</option>
                                            {
                                                accounts.map(account => (
                                                    <option key={account.id} value={account.id}>{account.name}</option>
                                                ))
                                            }
                                        </select>
                                        <select className={styles.dropdown} name="transactionType" disabled={loading} onChange={handleChange}>
                                            <option value="">Transaction Type*</option>
                                            <option value={TransactionType.DEPOSIT}>DEPOSIT</option>
                                            <option value={TransactionType.WITHDRAWAL}>WITHDRAWAL</option>
                                        </select>
                                        <input className={styles.amount} type="text" name="amount" placeholder="0.00" value={transactionRequest.amount} onChange={handleChange} disabled={withdrawal} required></input>
                                        <select className={styles.dropdown} name="repeatUnit" disabled={loading} onChange={handleChange}>
                                            <option value="">Repeat Unit*</option>
                                            <option value={RepeatUnit.DAY}>DAY</option>
                                            <option value={RepeatUnit.WEEK}>WEEK</option>
                                            <option value={RepeatUnit.MONTH}>MONTH</option>
                                            <option value={RepeatUnit.YEAR}>YEAR</option>
                                        </select>
                                        <input className={styles.amount} type="text" name="repeatInterval" placeholder="Interval" value={transactionRequest.repeatInterval} onChange={handleChange} disabled={loading}></input>
                                        <button className={styles.submit} type="submit" disabled={loading}>Create</button>
                                    </div>
                                </div>
                            </form>
                            {error && <p>{error}</p>}
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
                            {/* {
                                transactions.map(transaction => (
                                    <tr className={styles.tr} key={transaction.id}>
                                    </tr>
                                ))
                            } */}
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