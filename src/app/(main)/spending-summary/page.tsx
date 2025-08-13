'use client'

import { AuthContext } from "@/context/AuthContext"
import { CategoryContext } from "@/context/CategoryContext"
import { TransactionContext } from "@/context/TransactionContext"
import { getCategorySpending, getTopFiveTotal } from "@/lib/category"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import styles from "@/styles/spending-summary.module.css"
import { BudgetContext } from "@/context/BudgetContext"
import { getBudgetSpending, getOverallBudgetData} from "@/lib/budget"
import { calculateSpendingCoordinates } from "@/lib/transaction"
import Link from "next/link"

export default function SpendingSummary() {
    const router = useRouter()
    const {categories} = useContext(CategoryContext)
    const {transactions} = useContext(TransactionContext)
    const {budgets} = useContext(BudgetContext)
    const [total, setTotal] = useState<number>(0)
    const colors = ["cornflowerblue", "mediumseagreen", "mediumpurple", "cadetblue", "slategray"]
    const {token, loading, currentCustomer, logout} = useContext(AuthContext)
    const [coordinates, setCoordinates] = useState<string>("")

    //redirect to home if no local stored customer info
    useEffect(() => {
        if (!loading && (!token || !currentCustomer)) {window.location.href='/welcome'}
    }, [token, currentCustomer, loading])

    useEffect(() => {
        const getCoordinates = async() => {
            if (token) {
                const coordinates = await calculateSpendingCoordinates(token, "650")
                setCoordinates(coordinates)
            }
        }
        getCoordinates()
    },[token, transactions])

    useEffect(() => {
        setTotal(getTopFiveTotal(transactions, categories))
    }, [categories, transactions])

    // show nothing while still loading/no local stored customer info
    if (loading || (!token || !currentCustomer)) {return null}

    return (
        <div className="background">
            <div className="book">
                <div className="page-left">
                    <div className="page-header">
                        <h1 className="title">Spending Summary</h1>
                    </div>
                    <h2 className="subtitle">TOP 5 SPENDING CATEGORIES</h2>
                    <svg className={styles.pieChart} height="250" width="250" viewBox="0 0 20 20">
                        <circle r="10" cx="10" cy="10" fill="lightblue" />

                        {categories && transactions && total &&
                            [...categories]
                            .sort((a, b) =>
                                getCategorySpending(b.name, transactions) - getCategorySpending(a.name, transactions)
                            )
                            .slice(0, 5)
                            .map((category, index) => {
                                const spending = getCategorySpending(category.name, transactions);
                                const percent = spending / total
                                const dash = (percent * 31.4)

                                return (
                                <circle
                                    key={category.name}
                                    r={5}
                                    cx={10}
                                    cy={10}
                                    fill="transparent"
                                    stroke={colors[index]}
                                    strokeWidth={10}
                                    strokeDasharray={`${dash} 31.4`}
                                    transform={`rotate(-90) translate(-20)`}
                                />
                                )
                            })
                        }
                    </svg>
                    <div className="tableWrapper">
                        <table className="table">
                            <thead className="thead">
                                <tr className={styles.tr}>
                                    <th className="th">Category</th>
                                    <th className="th">Total Spent</th>
                                </tr>
                            </thead>
                            <tbody className="tbody">
                                {
                                    [...categories].sort((a,b) => getCategorySpending(b.name, transactions) - getCategorySpending(a.name, transactions))
                                    .slice(0,5).map(category => (
                                        <tr className={styles.tr} key={category.id}>
                                            <td className="td">{category.name}</td>
                                            <td className="td">${getCategorySpending(category.name, transactions).toFixed(2)}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="page-right">
                    <div className="page-header"></div>
                    <h2 className="subtitle">MONTH-BY-MONTH SPENDING FOR {new Date().getFullYear()}</h2>
                    {coordinates &&
                    <>
                        <svg viewBox="0 0 600 100" className={styles.lineGraph}>
                            <polyline
                                className={styles.polyLine}
                                fill="none"
                                stroke="#0074d9"
                                strokeWidth="3"
                                points={coordinates}
                            />
                        </svg>
                        <div className={styles.months}>
                            <p>Jan</p><p>Feb</p><p>Mar</p><p>Apr</p><p>May</p><p>Jun</p><p>Jul</p><p>Aug</p><p>Sep</p><p>Oct</p><p>Nov</p><p>Dec</p>
                        </div>
                    </>
                    }
                    <h2 className="subtitle">CURRENT BUDGET SPENDING SUMMARY</h2>
                    <p className={styles.summaryText}>${getOverallBudgetData(budgets, transactions).spent.toFixed(2)} spent of ${getOverallBudgetData(budgets, transactions).limit.toFixed(2)}</p>
                    <progress className={styles.progressBar} max="100" value={getOverallBudgetData(budgets, transactions).percentage.toString()}>70%</progress>
                    <div className="tableWrapper">
                        <p className={styles.info}>Budgets marked with &#10071; have reached 75% of their limit.</p>
                        <p className={styles.info}>Budgets marked with &#128721; have reached 100% of their limit.</p>
                        <table className="table">
                            <thead className="thead">
                                <tr className={styles.tr2}>
                                    <th className="th">Category</th>
                                    <th className="th">Spent</th>
                                    <th className="th">Limit</th>
                                    <th className="th">Period</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {
                                    budgets.map(budget => (
                                            <tr className={styles.tr2} key={budget.id}>
                                                <td className="td">{budget.category}</td>
                                                <td className="td">${getBudgetSpending(budget, transactions)}</td>
                                                <td className="td">${budget.budgetLimit}</td>
                                                <td className="td">{budget.timePeriod}</td>
                                                {(getBudgetSpending(budget, transactions)/ budget.budgetLimit) * 100 >= 75 && (getBudgetSpending(budget, transactions)/ budget.budgetLimit) * 100 < 100 && <td className={styles.warn}>&#10071;</td>}
                                                {(getBudgetSpending(budget, transactions)/ budget.budgetLimit) * 100 >= 100 && <td className={styles.warn}>&#128721;</td>}
                                            </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="buttons">
                <button className="topButton" onClick={() => router.push('/table-of-contents')}>Table of Contents</button>
                <button className="topButton" onClick={() => router.push('/edit-profile')}>Edit Profile</button>
                <button className="topButton" onClick={logout}>Logout</button>
            </div>
            <Link className="leftPageArr" href="/my-transactions">&larr;</Link>
            <Link className="rightPageArr" href="/edit-profile">&rarr;</Link>
        </div>
    )
}