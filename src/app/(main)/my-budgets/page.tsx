'use client'

import { AuthContext } from "@/context/AuthContext"
import { fetchCreateBudget, fetchCustomerBudgets } from "@/lib/budget"
import { fetchCustomerCategories } from "@/lib/category"
import styles from "@/styles/my-budgets.module.css"
import { Budget } from "@/types/Budget"
import { BudgetRequest } from "@/types/BudgetRequest"
import { Category } from "@/types/Category"
import { TimePeriod } from "@/types/TimePeriod"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"

export default function MyBudgets() {
    const [error, setError] = useState<String>("")
    const [loading, setLoading] = useState<boolean>(false)
    const {token, logout} = useContext(AuthContext)
    const [budgetRequest, setBudgetRequest] = useState<BudgetRequest>({category: "", budgetLimit: "", timePeriod: ""})
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [refresh, setRefresh] = useState<number>(0)
    const router = useRouter()
    const [edit, setEdit] = useState<boolean>(false)
    const [budgetId, setBudgetId] = useState<number | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    
    useEffect(() => {
        setLoading(true)
        const getCustomerCategories = async () => {
            try {
                if (token) {
                    const response = await fetchCustomerCategories(token)
                    if (response.ok) {
                        const data = await response.json()
                        setCategories(data)
                    } else {
                        const error = await response.json()
                        setError(error.message)
                    }
                }
            } catch (err) {
                setError("An unexpected error occurred")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        getCustomerCategories()
    }, [refresh, token])

    useEffect(() => {
        setLoading(true)
        const getCustomerBudgets = async () => {
            try {
                if (token) {
                    const response = await fetchCustomerBudgets(token)
                    if (response.ok) {
                        const data = await response.json()
                        setBudgets(data)
                    } else {
                        const error = await response.json()
                        setError(error.message)
                    }
                }
            } catch (err) {
                setError("An unexpected error occurred")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        getCustomerBudgets()
    }, [refresh, token])
    
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const submitBudgetRequest = async () => {
            try {
                if (token) {
                    const response = await fetchCreateBudget(token, budgetRequest)
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
        submitBudgetRequest()
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setError("")
        const {name, value} = event.target
        if (name === "budgetLimit") {
            // Accept: empty string or numbers with up to 2 decimal places
            const regex = /^\d*(\.\d{0,2})?$/
            if (!regex.test(value)) return
        }
        setBudgetRequest(prev => ({
            ...prev,
            [name]: value
        }))
    }

    function openEdit(budget: Budget) {
        setEdit(true)
        setBudgetRequest({category: "", budgetLimit: "", timePeriod: ""})
        setBudgetId(budget.id)
    }

    return (
        <div className="background">
            <div className="book">
                <div className="page-left"></div>
                <div className="page-right">
                    <div className="page-header">
                        <h1 className={styles.title}>Budget Management</h1>
                    </div>
                    {!edit && 
                        <>
                            <h2 className="subtitle">ADD NEW BUDGET</h2>
                            <form className={styles.form} onSubmit={handleSubmit}>
                                <select className={styles.category} name="category" disabled={loading} onChange={handleChange}>
                                    <option value="">Category*</option>
                                    {
                                        categories.map(category => (
                                            <option key={category.id} value={category.name}>{category.name}</option>
                                        ))
                                    }
                                </select>
                                <div className={styles.row}>
                                    <input className={styles.limit} type="text" name="budgetLimit" placeholder="0.00" value={budgetRequest.budgetLimit} onChange={handleChange} disabled={loading} required></input>
                                    <select className={styles.dropdown} name="timePeriod" disabled={loading} onChange={handleChange}>
                                        <option value="">Time Period*</option>
                                        <option value={TimePeriod.MONTH}>MONTH</option>
                                        <option value={TimePeriod.QUARTER}>QUARTER</option>
                                        <option value={TimePeriod.YEAR}>YEAR</option>
                                    </select>
                                    <button className={styles.submit} type="submit" disabled={loading}>Create</button>
                                </div>
                                {error && <p>{error}</p>}
                            </form>
                        </>
                    }
                    <h2 className="subtitle">VIEW BUDGETS</h2>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr className={styles.tr}>
                                    <th className={styles.th}>Category</th>
                                    <th className={styles.th}>Limit/Time Period</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                            {
                                budgets.map(budget => (
                                    <tr className={styles.tr} key={budget.id}>
                                        <td className={styles.td}>{budget.category}</td>
                                        <td className={styles.td}>${budget.budgetLimit} / {budget.timePeriod}</td>
                                        <td className={styles.edit} onClick={() => openEdit(budget)}>&#8942;</td>
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