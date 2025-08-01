'use client'

import { AccountContext } from "@/context/AccountContext"
import { AuthContext } from "@/context/AuthContext"
import { fetchCreateAccount, fetchCustomerAccounts, fetchArchiveAccount, fetchUpdateAccount } from "@/lib/account"
import styles from "@/styles/my-accounts.module.css"
import { Account } from "@/types/Account"
import { AccountRequest } from "@/types/AccountRequest"
import { AccountType } from "@/types/AccountType"
import { useRouter } from "next/navigation"
import { useContext, useState } from "react"

export default function MyAccounts() {
    const [error, setError] = useState<String>("")
    const [loading, setLoading] = useState<boolean>(false)
    const {token, logout} = useContext(AuthContext)
    const [accountRequest, setAccountRequest] = useState<AccountRequest>({name: "", type: "", balance: "0.00"})
    const router = useRouter()
    const [edit, setEdit] = useState<boolean>(false)
    const [selectedOption, setSelectedOption] = useState("")
    const [accountId, setAccountId] = useState<number | null>(null)
    const {accounts, refresh, loadingAccounts, accountError} = useContext(AccountContext)

    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setError("")
        const {name, value} = event.target
        if (name === "balance") {
            // Accept: empty string or numbers with up to 2 decimal places
            const regex = /^\d*(\.\d{0,2})?$/
            if (!regex.test(value)) return
        }
        if (edit && name === "type") {
            setSelectedOption(value) 
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
        submitAccountRequest()
    }

    function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const submitEditAccountRequest = async () => {
            const nativeEvent = event.nativeEvent as SubmitEvent;
            const submitter = nativeEvent.submitter as HTMLButtonElement;
            try {
                if (token) {
                    let response;
                    if (submitter.value === "save") {
                        response = await fetchUpdateAccount(token, accountId!, accountRequest)
                    } else if (submitter.value === "delete") {
                        response = await fetchArchiveAccount(token, accountId!)
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
        submitEditAccountRequest()
        setAccountId(null)
        setAccountRequest({name: "", type: "", balance: "0.00"})
        setEdit(false)
    }

    function openEdit(account: Account) {
        setEdit(true)
        setAccountRequest({name: account.name, type: account.type, balance: account.balance.toString()})
        setSelectedOption(account.type.toString())
        setAccountId(account.id)
    }

    return (
        <div className="background">
            <div className="book">
                <div className="page-left"></div>
                <div className="page-right">
                    <div className="page-header">
                        <h1 className={styles.title}>Account Management</h1>
                    </div>
                    {!edit && 
                        <>
                            <h2 className="subtitle">ADD NEW ACCOUNT</h2>
                            <form className={styles.form} onSubmit={handleSubmit}>
                                <input className={styles.name} type="text" name="name" placeholder="Account Name*" value={accountRequest.name} onChange={handleChange} disabled={loading} required></input>
                                <div className={styles.row}>
                                    <select className={styles.dropdown} name="type" disabled={loading} onChange={handleChange}>
                                        <option value="">Account Type*</option>
                                        <option value={AccountType.CHECKING}>CHECKING</option>
                                        <option value={AccountType.SAVINGS}>SAVINGS</option>
                                        <option value={AccountType.CASH}>CASH</option>
                                        <option value={AccountType.OTHER}>OTHER</option>
                                    </select>
                                    <input className={styles.balance} type="text" name="balance" placeholder="0.00" value={accountRequest.balance} onChange={handleChange} disabled={loading} required></input>
                                    <button className={styles.submit} type="submit" disabled={loading}>Create</button>
                                </div>
                                {error && <p>{error}</p>}
                            </form>
                        </>
                    }
                    {edit &&
                        <>
                            <h2 className="subtitle">EDIT ACCOUNT</h2>
                            <form className={styles.form} onSubmit={handleEditSubmit}>
                                <input className={styles.name} type="text" name="name" placeholder="Account Name*" value={accountRequest.name} onChange={handleChange} disabled={loading} required></input>
                                <div className={styles.row2}>
                                    <select className={styles.dropdown} name="type" value={selectedOption} disabled={loading} onChange={handleChange}>
                                        <option value="">Account Type*</option>
                                        <option value={AccountType.CHECKING}>CHECKING</option>
                                        <option value={AccountType.SAVINGS}>SAVINGS</option>
                                        <option value={AccountType.CASH}>CASH</option>
                                        <option value={AccountType.OTHER}>OTHER</option>
                                    </select>
                                    <input className={styles.balance} type="text" name="balance" value={accountRequest.balance} disabled={true} required></input>
                                    <button className={styles.submit} name="action" value="save" type="submit" disabled={loading}>Save</button>
                                    <button className={styles.submit} name="action" value="delete" type="submit" disabled={loading}>Delete</button>
                                </div>
                                {error && <p>{error}</p>}
                            </form>
                        </>
                    }
                    <h2 className="subtitle">VIEW ACCOUNTS</h2>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr className={styles.tr}>
                                    <th className={styles.th}>Name</th>
                                    <th className={styles.th}>Type</th>
                                    <th className={styles.th}>Balance</th>
                                </tr>
                            </thead>
                            {loadingAccounts && <p>Loading Accounts, please wait...</p>}
                            {accountError && <p>{accountError}</p>}
                            <tbody className={styles.tbody}>
                            {
                                accounts.map(account => (
                                    <tr className={styles.tr} key={account.id}>
                                        <td className={styles.td}>{account.name}</td>
                                        <td className={styles.td}>{account.type}</td>
                                        <td className={styles.td}>${account.balance}</td>
                                        <td className={styles.edit} onClick={() => openEdit(account)}>&#8942;</td>
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