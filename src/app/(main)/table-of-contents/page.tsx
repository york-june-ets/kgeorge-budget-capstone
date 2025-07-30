'use client'

import { AuthContext } from "@/context/AuthContext"
import styles from "@/styles/table-of-contents.module.css"
import { useRouter } from "next/navigation"
import { useContext } from "react"

export default function TableOfContents() {
    const router = useRouter()
    const {logout} = useContext(AuthContext)
    return (
        <div className="background">
            <div className="book">
                <div className={styles.backCover} onClick={() => router.push('/')}></div>
                <div className="page-right">
                    <h1 className={styles.title}>Table of Contents</h1>
                    <ol className={styles.contents}>
                        <li onClick={() => router.push('/my-accounts')}>Manage Accounts</li>
                        <li onClick={() => router.push('/my-transactions')}>Manage Transactions</li>
                        <li onClick={() => router.push('/my-budgets')}>Manage Budgets</li>
                        <li onClick={() => router.push('/spending-summary')}>Spending Summary</li>
                        <li onClick={() => router.push('/edit-profile')}>Edit Profile</li>
                    </ol>
                </div>
            </div>
            <button className="logout" onClick={logout}>logout</button>
        </div>
    )
}