'use client'

import { AuthContext } from "@/context/AuthContext"
import { CategoryContext } from "@/context/CategoryContext"
import { TransactionContext } from "@/context/TransactionContext"
import { getCategorySpending } from "@/lib/category"
import { useRouter } from "next/navigation"
import { useContext } from "react"
import styles from "@/styles/spending-summary.module.css"

export default function SpendingSummary() {
    const router = useRouter()
    const {logout} = useContext(AuthContext)
    const {categories} = useContext(CategoryContext)
    const {transactions} = useContext(TransactionContext)
    return (
        <div className="background">
            <div className="book">
                <div className="page-left">
                </div>
                <div className="page-right">
                    <div className="page-header">
                        <h1 className={styles.title}>Spending Summary</h1>
                    </div>
                    <h2 className="subtitle">TOP 5 SPENDING CATEGORIES</h2>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr className={styles.tr}>
                                    <th className={styles.th}>Category</th>
                                    <th className={styles.th}>Spent</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {
                                    [...categories].sort((a,b) => getCategorySpending(b.name, transactions) - getCategorySpending(a.name, transactions))
                                    .slice(0,5).map(category => (
                                        <tr className={styles.tr} key={category.id}>
                                            <td className={styles.td}>{category.name}</td>
                                            <td className={styles.td}>{getCategorySpending(category.name, transactions).toFixed(2)}</td>
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