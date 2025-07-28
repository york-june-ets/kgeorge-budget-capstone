'use client'

import { AuthContext } from "@/context/AuthContext"
import styles from "@/styles/budget-book.module.css"
import { useRouter } from "next/navigation"
import { useContext, useEffect } from "react"

export default function BudgetBook() {
    const router = useRouter()
    const {token, currentCustomer, loading} = useContext(AuthContext)

    //redirect to home if no local stored customer info
    useEffect(() => {
        if (!loading && (!token || !currentCustomer)) {window.location.href='/welcome'}
    }, [token, currentCustomer, loading])

    // show nothing while still loading/no local stored customer info
    if (loading || (!token || !currentCustomer)) {return null}
    
    return (
        <div className={styles.cover} onClick={() => router.push('/table-of-contents')}>
            <div className={styles.top}>
                <div className="logo">
                    <img className="logo_img" src="/logo.png"></img>
                    <h1 className="logo_text">BudgetBook</h1>
                </div>
                <div className={styles.dots}>
                    <div className={styles.dot}></div>
                    <div className={styles.dot}></div>
                    <div className={styles.dot}></div>
                </div>
            </div>
            <div className={styles.title}>
                <span className={styles.text_budget}>BUDGET</span>
                <br></br>
                <span className={styles.text_book}>BOOK</span>
            </div>
            <p className={styles.text}>Welcome back. It’s time to turn the page on your finances and start a new chapter—organize your budget, grow your savings, and build your future.</p>
            <div className={styles.rectangle}></div>
            <div className={styles.dots}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
            </div>
            <a className={styles.site_link} href='/'>www.budgetbook.com</a>
            <img className={styles.city} src="/city.png"></img>
        </div>
    )
}