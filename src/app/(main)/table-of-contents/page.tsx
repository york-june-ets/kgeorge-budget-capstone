'use client'

import { AuthContext } from "@/context/AuthContext"
import styles from "@/styles/table-of-contents.module.css"
import { useRouter } from "next/navigation"
import { useContext } from "react"

export default function TableOfContents() {
    const router = useRouter()
    const {logout} = useContext(AuthContext)
    return (
        <div className={styles.book}>
            <div className={styles.backCover} onClick={()=> router.push('/')}></div>
            <div className="page-right">
                <h1 className={styles.title}>Table of Contents</h1>
                <ol className={styles.contents}>
                    <li>Manage Accounts</li>
                    <li>Manage Transactions</li>
                    <li>Manage Budgets</li>
                    <li>Spending Summary</li>
                    <li>Edit Profile</li>
                </ol>
            </div>
            <button className="logout" onClick={logout}>logout</button>
        </div>
    )
}