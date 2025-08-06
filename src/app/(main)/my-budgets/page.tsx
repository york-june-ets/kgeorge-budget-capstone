'use client'

import { AuthContext } from "@/context/AuthContext"
import { BudgetContext } from "@/context/BudgetContext"
import { CategoryContext } from "@/context/CategoryContext"
import { fetchArchiveBudget, fetchCreateBudget, fetchCustomerBudgets, fetchUpdateBudget } from "@/lib/budget"
import { fetchCustomerCategories } from "@/lib/category"
import styles from "@/styles/my-budgets.module.css"
import { Budget } from "@/types/Budget"
import { BudgetRequest } from "@/types/BudgetRequest"
import { Category } from "@/types/Category"
import { TimePeriod } from "@/types/TimePeriod"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"

export default function MyBudgets() {
    const [error, setError] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const {token, logout} = useContext(AuthContext)
    const [budgetRequest, setBudgetRequest] = useState<BudgetRequest>({category: "", budgetLimit: "", timePeriod: ""})
    const router = useRouter()
    const [edit, setEdit] = useState<boolean>(false)
    const [budgetId, setBudgetId] = useState<number | null>(null)
    const [selectedTimePeriod, setSelectedTimePeriod] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const {budgets, refresh, loadingBudgets, budgetError} = useContext(BudgetContext)
    const {categories} = useContext(CategoryContext)
    
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const submitBudgetRequest = async () => {
            try {
                if (token) {
                    const response = await fetchCreateBudget(token, budgetRequest)
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
        submitBudgetRequest()
    }

    function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const submitEditBudgetRequest = async () => {
            const nativeEvent = event.nativeEvent as SubmitEvent;
            const submitter = nativeEvent.submitter as HTMLButtonElement;
            try {
                if (token) {
                    let response;
                    if (submitter.value === "save") {
                        response = await fetchUpdateBudget(token, budgetId!, budgetRequest)
                    } else if (submitter.value === "delete") {
                        response = await fetchArchiveBudget(token, budgetId!)
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
        submitEditBudgetRequest()
        setBudgetId(null)
        setBudgetRequest({category: "", budgetLimit: "", timePeriod: ""})
        setEdit(false)
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setError("")
        const {name, value} = event.target
        if (name === "budgetLimit") {
            // Accept: empty string or numbers with up to 2 decimal places
            const regex = /^\d*(\.\d{0,2})?$/
            if (!regex.test(value)) return
        }
        if (edit && name === "type") {setSelectedTimePeriod(value)}
        setBudgetRequest(prev => ({
            ...prev,
            [name]: value
        }))
    }

    function openEdit(budget: Budget) {
        setEdit(true)
        setBudgetRequest({category: budget.category, budgetLimit: budget.budgetLimit.toString(), timePeriod: budget.timePeriod})
        setBudgetId(budget.id)
        setSelectedTimePeriod(budget.timePeriod)
        setSelectedCategory(budget.category)
    }

    return (
        <div className="background">
            <div className="book">
                <div className="page-left">
                    <div className="page-header">
                        <h1 className="title">Budget Management</h1>
                    </div>
                    {!edit && 
                        <>
                            <h2 className="subtitle">ADD NEW BUDGET</h2>
                            <form className="form" onSubmit={handleSubmit}>
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
                                    <button className="submit" type="submit" disabled={loading}>Create</button>
                                </div>
                                {error && <p>{error}</p>}
                            </form>
                        </>
                    }
                    {edit && 
                        <>
                            <h2 className="subtitle">ADD NEW BUDGET</h2>
                            <form className="form" onSubmit={handleEditSubmit}>
                                <select className={styles.category} name="category" value={selectedCategory} disabled={true} onChange={handleChange}>
                                    <option value="">Category*</option>
                                    {
                                        categories.map(category => (
                                            <option key={category.id} value={category.name}>{category.name}</option>
                                        ))
                                    }
                                </select>
                                <div className={styles.row2}>
                                    <input className={styles.limit} type="text" name="budgetLimit" placeholder="0.00" value={budgetRequest.budgetLimit} onChange={handleChange} disabled={loading} required></input>
                                    <select className={styles.dropdown} name="timePeriod" value={selectedTimePeriod} disabled={loading} onChange={handleChange}>
                                        <option value="">Time Period*</option>
                                        <option value={TimePeriod.MONTH}>MONTH</option>
                                        <option value={TimePeriod.QUARTER}>QUARTER</option>
                                        <option value={TimePeriod.YEAR}>YEAR</option>
                                    </select>
                                    <button className="submit" type="submit" name="action" value="save" disabled={loading}>Save</button>
                                    <button className="submit" type="submit" name="action" value="delete" disabled={loading}>Delete</button>
                                </div>
                                {error && <p>{error}</p>}
                            </form>
                        </>
                    }
                </div>
                <div className="page-right">
                    <div className="page-header"></div>
                    <h2 className="subtitle">VIEW BUDGETS</h2>
                    <div className="tableWrapper">
                        <table className="table">
                            <thead className="thead">
                                <tr className={styles.tr}>
                                    <th className="th">Category</th>
                                    <th className="th">Limit/Time Period</th>
                                </tr>
                            </thead>
                            <tbody className="tbody">
                            {
                                budgets.map(budget => (
                                    <tr className={styles.tr} key={budget.id}>
                                        <td className="td">{budget.category}</td>
                                        <td className="td">${budget.budgetLimit} / {budget.timePeriod}</td>
                                        <td className="edit" onClick={() => openEdit(budget)}>&#8942;</td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                        {loadingBudgets && <p>Loading Budgets, please wait...</p>}
                            {budgetError && <p>{budgetError}</p>}
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