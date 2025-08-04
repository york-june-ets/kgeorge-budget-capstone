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
                    <div className={styles.header}>
                        <h1 className={styles.title}>Budget Handbook</h1>
                        <h1 className={styles.subtitle}>Table of Contents</h1>
                    </div>
                        <div className={styles.row}>
                            <div className={styles.rowLeft}>
                                <p className={styles.number}>01</p>
                                <hr className={styles.hr}></hr>
                            </div>
                            <div className={styles.text}>
                                <h3 onClick={() => router.push('/my-accounts')}>Manage Accounts &rarr;</h3>
                                <p>Create and manage your bank accounts to track your total income and spending per account.</p>
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.rowLeft}>
                                <p className={styles.number}>02</p>
                                <hr className={styles.hr}></hr>
                            </div>
                            <div className={styles.text}>
                                <h3 onClick={() => router.push('/my-categories')}>Manage Categories &rarr;</h3>
                                <p>Create and manage spending categories to track how you spend.</p>
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.rowLeft}>
                                <p className={styles.number}>03</p>
                                <hr className={styles.hr}></hr>
                            </div>
                            <div className={styles.text}>
                                <h3 onClick={() => router.push('/my-budgets')}>Manage Budgets &rarr;</h3>
                                <p>Create and manage budgets to set spending limits per category and grow your savings.</p>
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.rowLeft}>
                                <p className={styles.number}>04</p>
                                <hr className={styles.hr}></hr>
                            </div>
                            <div className={styles.text}>
                                <h3 onClick={() => router.push('/my-transactions')}>Manage Transactions &rarr;</h3>
                                <p>View, log, categorize, and filter your transactions to track your earnings, spending, and saving.</p>
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.rowLeft}>
                                <p className={styles.number}>05</p>
                                <hr className={styles.hr}></hr>
                            </div>
                            <div className={styles.text}>
                                <h3 onClick={() => router.push('/spending-summary')}>Spending Summary &rarr;</h3>
                                <p>View your spending analytics to help you compare your spending to your spending goals.</p>
                            </div>
                        </div>
                </div>
            </div>
            <div className="buttons">
                <button className="topButton" onClick={() => router.push('/edit-profile')}>Edit Profile</button>
                <button className="topButton" onClick={logout}>Logout</button>
            </div>
        </div>
    )
}