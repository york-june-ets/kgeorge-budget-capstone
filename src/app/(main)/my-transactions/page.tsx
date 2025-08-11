'use client'

import { AuthContext } from "@/context/AuthContext"
import { Transaction } from "@/types/Transaction"
import { TransactionRequest } from "@/types/TransactionRequest"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useRef, useState } from "react"
import styles from "@/styles/my-transactions.module.css"
import { AccountContext } from "@/context/AccountContext"
import { TransactionType } from "@/types/TransactionType"
import { RepeatUnit } from "@/types/RepeatUnit"
import { CategoryContext } from "@/context/CategoryContext"
import { downloadTransactionCsv, fetchArchiveTransaction, fetchCreateTransaction, fetchCustomerTransactions, fetchUpdateTransaction } from "@/lib/transaction"
import { TransactionContext } from "@/context/TransactionContext"
import { Allocation } from "@/types/Allocation"
import { TransactionFilters } from "@/types/TransactionFilters"

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
    const {transactions, transactionFilters, setTransactionFilters, totalPages, loadingTransactions, refresh, transactionError} = useContext(TransactionContext)
    const [loadingAllocations, setLoadingAllocations] = useState<boolean>(false)
    const [allocationError, setAllocationError] = useState<string | null>(null)
    const [selectedAccount, setSelectedAccount] = useState<string | "">("")
    const [selectedUnit, setSelectedUnit] = useState<string>("")
    const [selectedType, setSelectedType] = useState<string>("")
    const filterFormRef = useRef<HTMLFormElement>(null)
    const [currentPage, setCurrentPage] = useState<number>(0)

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
            setSelectedAccount(value)
        }
        setTransactionRequest(prev => ({
            ...prev,
            [name]: value
        }))
    }

    function handleFilterChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | React.MouseEvent<HTMLButtonElement>) {
        setError("")
        const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLButtonElement
        const { name, value } = target;
        if (name === "page") {
            if (Number(value) == transactionFilters.page - 1 && Number(value) < 0) {
                return 
            } else if (Number(value) == transactionFilters.page + 1. && Number(value) > totalPages - 1) {
                return 
            } else {
                setCurrentPage(Number(value))
            }
        }
        setTransactionFilters(prev => ({
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
                        return
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

    const handleDownload = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        try {
            if (token) {
                await downloadTransactionCsv(token, transactionFilters)
            }
        } catch (err) {
            setError("An unexpected error occured")
            console.error(err)
        } finally {
            setLoading(false)
        }
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

    function resetFilterForm() {
        setTransactionFilters({dateTo: "", dateFrom: "", transactionType: "", accountId: "", categoryId: "", page: 0})
        filterFormRef.current?.reset()
    }

    return (
        <div className="background">
            <div className="book">
                <div className="page-left">
                    <div className="page-header">
                        <h1 className="title">Transaction Management</h1>
                    </div>
                    {edit &&
                        <h2 className="subtitle">EDIT TRANSACTION</h2>
                    }
                    {!edit &&
                        <h2 className="subtitle">ADD NEW TRANSACTION</h2>
                    }
                    <form className="form" onSubmit={(event) => submitHandler(event)}>
                            <div className={styles.formBase}>
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
                                            <button className="submit" type="submit" name="action" value="save" disabled={loading}>Save</button>
                                            <button className="submit" type="submit" name="action" value="delete" disabled={loading}>Delete</button>
                                        </div>
                                    }
                                    {!edit &&
                                        <button className="submit" type="submit" disabled={loading}>Create</button>
                                    }
                                </div>
                            </div>
                            {withdrawal &&
                                <div className={styles.allocationWrapper}>
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
                        </form>
                        {error && <p>{error}</p>}
                    </div>
                <div className="page-right">
                    <div className="page-header"></div>
                    {edit &&
                        <h2 className="subtitle">VIEW TRANSACTION DETAIL</h2>
                    }
                    {!edit &&
                        <>
                            <h2 className="subtitle">VIEW TRANSACTIONS</h2>
                            <form className={styles.filterGrid} onSubmit={handleDownload} ref={filterFormRef}>
                                <label>Start: <input type="date" name="dateFrom" value={transactionFilters.dateFrom} onChange={handleFilterChange} disabled={loading}></input></label>
                                <label>End: <input type="date" name="dateTo" value={transactionFilters.dateTo} onChange={handleFilterChange} disabled={loading}></input></label>
                                <select name="accountId" disabled={loadingAccounts || loading} onChange={handleFilterChange}>
                                    <option value={""}>Account</option>
                                    {
                                        accounts.map(account => (
                                            <option key={account.id} value={account.id}>{account.name}</option>
                                        ))
                                    }
                                </select>
                                <select name="transactionType" disabled={loading} onChange={handleFilterChange}>
                                    <option value={""}>Transaction Type</option>
                                    <option value={TransactionType.DEPOSIT}>DEPOSIT</option>
                                    <option value={TransactionType.WITHDRAWAL}>WITHDRAWAL</option>
                                </select>
                                <select name="categoryId" disabled={loadingCategories || loading} onChange={handleFilterChange}>
                                    <option value={""}>Category</option>
                                    {
                                        categories.map(category => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))
                                    }
                                </select>
                                <div className={styles.buttons}>
                                    <button type="button" onClick={resetFilterForm}>Clear</button>
                                    <button type="submit">Download</button>
                                </div>
                            </form>
                        </>
                    }
                    <div className="tableWrapper">
                        <table className="table">
                            <thead className="thead">
                                <tr className={styles.tr}>
                                    <th className="th">Date</th>
                                    <th className="th">Description</th>
                                    <th className="th">Account</th>
                                    <th className="th">Amount</th>
                                    <th className="th">Repeat</th>
                                </tr>
                            </thead>
                            <tbody className="tbody">
                            {!edit &&
                                transactions.map(transaction => (
                                    <tr className={styles.tr} key={transaction.id}>
                                        <td className="td">{transaction.date}</td>
                                        <td className="td">{transaction.description}</td>
                                        <td className="td">{transaction.account.name}</td>
                                        <td className="td">{getSymbol(transaction.transactionType)} ${transaction.amount}</td>
                                        <td className="td">{transaction.repeatInterval} {transaction.repeatUnit}</td>
                                        <td className="edit" onClick={() => openEdit(transaction)}>&#8942;</td>
                                    </tr>
                                ))
                            }
                            {edit && transaction &&
                                <tr className={styles.tr}>
                                    <td className="td">{transaction.date}</td>
                                    <td className="td">{transaction.description}</td>
                                    <td className="td">{transaction.account.name}</td>
                                    <td className="td">{getSymbol(transaction.transactionType)} ${transaction.amount}</td>
                                    <td className="td">{transaction.repeatInterval} {transaction.repeatUnit}</td>
                                </tr>
                            }
                            </tbody>
                        </table>
                        <div className="pagination">
                            <button type="button" name="page" value={transactionFilters.page - 1} onClick={handleFilterChange}>&larr;</button>
                            <p>Page {currentPage + 1} of {totalPages}</p>
                            <button type="button" name="page" value={transactionFilters.page + 1} onClick={handleFilterChange}>&rarr;</button>
                        </div>
                        <br/><br/><br/>
                        {edit && transaction && transaction.transactionType === "WITHDRAWAL" && 
                            <table className="table">
                                <thead className="thead">
                                    <tr className={styles.tr2}>
                                        <th className="th">Category</th>
                                        <th className="th">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="tbody">
                                    {
                                        transaction.allocations.map((allocation: Allocation) => (
                                            <tr className={styles.tr2} key={allocation.id}>
                                                <td className="td">{allocation.category}</td>
                                                <td className="td">{allocation.amount}</td>
                                                <td className="edit" onClick={() => setEdit(false)}>&#8942;</td>
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