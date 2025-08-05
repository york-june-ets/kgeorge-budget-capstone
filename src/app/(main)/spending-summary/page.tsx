'use client'

import { AuthContext } from "@/context/AuthContext"
import { CategoryContext } from "@/context/CategoryContext"
import { TransactionContext } from "@/context/TransactionContext"
import { getCategorySpending, getTopFiveTotal } from "@/lib/category"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import styles from "@/styles/spending-summary.module.css"
import { BudgetContext } from "@/context/BudgetContext"
import { getBudgetSpending } from "@/lib/budget"

export default function SpendingSummary() {
    const router = useRouter()
    const {logout} = useContext(AuthContext)
    const {categories} = useContext(CategoryContext)
    const {transactions} = useContext(TransactionContext)
    const {budgets} = useContext(BudgetContext)
    const [total, setTotal] = useState<number>(0)
    const colors = ["cornflowerblue", "mediumseagreen", "mediumpurple", "cadetblue", "slategray"]

    useEffect(() => {
        setTotal(getTopFiveTotal(transactions, categories))
    }, [categories, transactions])

    return (
        <div className="background">
            <div className="book">
                <div className="page-left">
                    <h2 className="subtitle">TOP 5 SPENDING CATEGORIES</h2>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr className={styles.tr}>
                                    <th className={styles.th}>Category</th>
                                    <th className={styles.th}>Total Spent</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {
                                    [...categories].sort((a,b) => getCategorySpending(b.name, transactions) - getCategorySpending(a.name, transactions))
                                    .slice(0,5).map(category => (
                                        <tr className={styles.tr} key={category.id}>
                                            <td className={styles.td}>{category.name}</td>
                                            <td className={styles.td}>${getCategorySpending(category.name, transactions).toFixed(2)}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                    <svg height="300" width="300" viewBox="0 0 20 20">
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
                            })}
                        </svg>
                    </div>
                <div className="page-right">
                    <div className="page-header">
                        <h1 className={styles.title}>Spending Summary</h1>
                    </div>
                    <h2 className="subtitle">CURRENT BUDGET SPENDING SUMMARY</h2>
                    <div className={styles.tableWrapper2}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr className={styles.tr}>
                                    <th className={styles.th}>Category</th>
                                    <th className={styles.th}>Current Status</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {
                                    budgets.map(budget => (
                                        <tr className={styles.tr} key={budget.id}>
                                            <td className={styles.td}>{budget.category}</td>
                                            <td className={styles.td}>${getBudgetSpending(budget, transactions)} / {budget.timePeriod}</td>
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
        </div>
    )
}