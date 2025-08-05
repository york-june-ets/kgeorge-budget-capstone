'use client'

import { AuthContext } from "@/context/AuthContext"
import { Category } from "@/types/Category"
import { Transaction } from "@/types/Transaction"
import { TransactionRequest } from "@/types/TransactionRequest"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import styles from "@/styles/my-transactions.module.css"
import { AccountContext } from "@/context/AccountContext"
import { TransactionType } from "@/types/TransactionType"
import { RepeatUnit } from "@/types/RepeatUnit"
import { CategoryContext } from "@/context/CategoryContext"
import { fetchArchiveTransaction, fetchCreateTransaction, fetchUpdateTransaction } from "@/lib/transaction"
import { TransactionContext } from "@/context/TransactionContext"
import { Allocation } from "@/types/Allocation"
import { fetchTransactionAllocations } from "@/lib/allocation"

export default function MyTransactions() {
    const [error, setError] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const {token, logout} = useContext(AuthContext)
    const [transactionRequest, setTransactionRequest] = useState<TransactionRequest>({
        date: "",
        accountId: null,
        description: "",
        allocations: [],
        amount: "",
        transactionType: null, 
        repeatUnit: "", 
        repeatInterval: "" 
    })
    const router = useRouter()
    const [edit, setEdit] = useState<boolean>(false)
    const [transaction, setTransaction] = useState<Transaction | null>(null)
    const [withdrawal, setWithdrawal] = useState<boolean>(false)
    const {accounts, loadingAccounts} = useContext(AccountContext)
    const {categories, loadingCategories} = useContext(CategoryContext)
    const {transactions, loadingTransactions, refresh, transactionError} = useContext(TransactionContext)
    const [loadingAllocations, setLoadingAllocations] = useState<boolean>(false)
    const [allocationError, setAllocationError] = useState<string | null>(null)
    const [selectedAccount, setSelectedAccount] = useState<string | "">("")
    const [selectedUnit, setSelectedUnit] = useState<string>("")
    const [selectedType, setSelectedType] = useState<string>("")

    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setError("")
        const {name, value} = event.target
        if (name === "repeatInterval") {
            // Accept: empty string or numbers (ints)
            const regex = /^\d*$/
            if (!regex.test(value)) return 
        }
        if (name === "transactionType") {
            setSelectedType(value)
            if (value === "WITHDRAWAL") {setWithdrawal(true)}
            else {setWithdrawal(false)}
        }
        if (name === "repeatUnit"){
            setSelectedUnit(value)
        }
        if (name === "accountId") {
            console.log(value)
            setSelectedAccount(value)
        }
        console.log(value)
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
        const submitTransactionRequest = async () => {
            try {
                if (token) {
                    const response = await fetchCreateTransaction(token, transactionRequest)
                    if (response.ok) {
                        refresh()
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
        submitTransactionRequest()
        resetForm()
    }

    function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const submitEditTransactionRequest = async () => {
            const nativeEvent = event.nativeEvent as SubmitEvent;
            const submitter = nativeEvent.submitter as HTMLButtonElement;
            try {
                if (token && transaction) {
                    let response;
                    if (submitter.value === "save") {
                        response = await fetchUpdateTransaction(token, transactionRequest, transaction.id)
                    } else if (submitter.value === "delete") {
                        response = await fetchArchiveTransaction(token, transaction.id)
                    } else {
                        setError('Something went wrong')
                        return;
                    }
                    if (response.ok) {
                        refresh()
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
        submitEditTransactionRequest()
        resetForm()
    }

    function resetForm() {
        setEdit(false)
        setWithdrawal(false)
        setTransaction(null)
        setTransactionRequest({
            date: "",
            accountId: null,
            description: "",
            allocations: [],
            amount: "",
            transactionType: null, 
            repeatUnit: "", 
            repeatInterval: "" 
        })
        setSelectedAccount("")
        setSelectedType("")
        setSelectedUnit("")
    }

    function getSymbol(transactionType: "DEPOSIT" | "WITHDRAWAL"): string {
        if (transactionType === "DEPOSIT") {return "+"}
        return "-"
    }

    function openEdit(transaction: Transaction) {
        setEdit(true)
        setTransactionRequest({
            date: transaction.date,
            accountId: transaction.account.id,
            description: transaction.description,
            allocations: transaction.allocations,
            amount: transaction.amount,
            transactionType: transaction.transactionType, 
            repeatUnit: transaction.repeatUnit, 
            repeatInterval: transaction.repeatInterval 
        })
        setTransaction(transaction)
        setSelectedAccount(transaction.account.id.toString())
        setSelectedType(transaction.transactionType)
        setSelectedUnit(transaction.repeatUnit)
        if (transaction.transactionType === "WITHDRAWAL") {setWithdrawal(true)}
    }

    function submitHandler(event: React.FormEvent<HTMLFormElement>) {
        if (!edit) {return handleSubmit(event)}
        else {return handleEditSubmit(event)}
    }

    return (
        <div className="background">
            <div className="book">
                <div className="page-left"></div>
                <div className="page-right">
                    <div className="page-header">
                        <h1 className={styles.title}>Transaction Management</h1>
                    </div>
                    {edit &&
                        <h2 className="subtitle">EDIT TRANSACTION</h2>
                    }
                    {!edit &&
                        <h2 className="subtitle">ADD NEW TRANSACTION</h2>
                    }
                        <form className={styles.form} onSubmit={(event) => submitHandler(event)}>
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
                                <div className={styles.row}>
                                    <input className={styles.date} type="date" name="date" value={transactionRequest.date} onChange={handleChange} disabled={loading} required></input>
                                    <input className={styles.description} type="text" name="description" placeholder="Decription*" value={transactionRequest.description} onChange={handleChange} disabled={loading} required></input>
                                </div>
                                <div className={styles.grid}>
                                    <select className={styles.account} name="accountId" value={selectedAccount} disabled={loadingAccounts || loading} onChange={handleChange}>
                                        <option value="">Account*</option>
                                        {
                                            accounts.map(account => (
                                                <option key={account.id} value={account.id}>{account.name}</option>
                                            ))
                                        }
                                    </select>
                                    <select className={styles.dropdown} name="transactionType" value={selectedType} disabled={loading} onChange={handleChange}>
                                        <option value="">Transaction Type*</option>
                                        <option value={TransactionType.DEPOSIT}>DEPOSIT</option>
                                        <option value={TransactionType.WITHDRAWAL}>WITHDRAWAL</option>
                                    </select>
                                    <input className={styles.amount} type="text" name="amount" placeholder="0.00" value={transactionRequest.amount} onChange={handleChange} disabled={withdrawal} required></input>
                                    <select className={styles.dropdown} name="repeatUnit" value={selectedUnit} disabled={loading} onChange={handleChange}>
                                        <option value="">Repeat Unit*</option>
                                        <option value={RepeatUnit.DAY}>DAY</option>
                                        <option value={RepeatUnit.WEEK}>WEEK</option>
                                        <option value={RepeatUnit.MONTH}>MONTH</option>
                                        <option value={RepeatUnit.YEAR}>YEAR</option>
                                    </select>
                                    <input className={styles.amount} type="text" name="repeatInterval" placeholder="Interval" value={transactionRequest.repeatInterval} onChange={handleChange} disabled={loading}></input>
                                    {edit &&
                                        <div className={styles.buttons}>
                                            <button className={styles.submit} type="submit" name="action" value="save" disabled={loading}>Save</button>
                                            <button className={styles.submit} type="submit" name="action" value="delete" disabled={loading}>Delete</button>
                                        </div>
                                    }
                                    {!edit &&
                                        <button className={styles.submit} type="submit" disabled={loading}>Create</button>
                                    }
                                </div>
                            </div>
                        </form>
                        {error && <p>{error}</p>}
                        {edit &&
                            <h2 className="subtitle">VIEW TRANSACTION DETAIL</h2>
                        }
                        {!edit &&
                            <h2 className="subtitle">VIEW TRANSACTIONS</h2>
                        }
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr className={styles.tr}>
                                    <th className={styles.th}>Date</th>
                                    <th className={styles.th}>Description</th>
                                    <th className={styles.th}>Account</th>
                                    <th className={styles.th}>Amount</th>
                                    <th className={styles.th}>Repeat</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                            {!edit &&
                                transactions.map(transaction => (
                                    <tr className={styles.tr} key={transaction.id}>
                                        <td className={styles.td}>{transaction.date}</td>
                                        <td className={styles.td}>{transaction.description}</td>
                                        <td className={styles.td}>{transaction.account.name}</td>
                                        <td className={styles.td}>{getSymbol(transaction.transactionType)} ${transaction.amount}</td>
                                        <td className={styles.td}>{transaction.repeatInterval} {transaction.repeatUnit}</td>
                                        <td className={styles.edit} onClick={() => openEdit(transaction)}>&#8942;</td>
                                    </tr>
                                ))
                            }
                            {edit && transaction &&
                                <tr className={styles.tr}>
                                    <td className={styles.td}>{transaction.date}</td>
                                    <td className={styles.td}>{transaction.description}</td>
                                    <td className={styles.td}>{transaction.account.name}</td>
                                    <td className={styles.td}>{getSymbol(transaction.transactionType)} ${transaction.amount}</td>
                                    <td className={styles.td}>{transaction.repeatInterval} {transaction.repeatUnit}</td>
                                </tr>
                            }
                            </tbody>
                        </table>
                        {edit && transaction && transaction.transactionType === "WITHDRAWAL" && 
                            <table className={styles.table}>
                                <thead className={styles.thead}>
                                    <tr className={styles.tr2}>
                                        <th className={styles.th}>Category</th>
                                        <th className={styles.th}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody className={styles.tbody}>
                                    {
                                        transaction.allocations.map((allocation: Allocation) => (
                                            <tr className={styles.tr2} key={allocation.id}>
                                                <td className={styles.td}>{allocation.category}</td>
                                                <td className={styles.td}>{allocation.amount}</td>
                                                <td className={styles.edit} onClick={() => setEdit(false)}>&#8942;</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        }
                        {edit && transaction && loadingAllocations && <p>Loading Allocations, please wait...</p>}
                        {edit && transaction && allocationError && <p>{allocationError}</p>}
                        {loadingTransactions && <p>Loading Trasactions, please wait...</p>}
                        {transactionError && <p>{transactionError}</p>}
                    </div>
                </div>
            </div>
            <div className="buttons">
                <button className="topButton" onClick={() => router.push('/table-of-contents')}>Table of Contents</button>
                <button className="topButton" onClick={() => router.push('/edit-profile')}>Edit Profile</button>
                <button className="topButton" onClick={logout}>Logout</button>
            </div>
        </div>
    )
}