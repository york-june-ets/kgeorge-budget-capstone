'use client'

import { AuthContext } from "@/context/AuthContext"
import { fetchCreateCategory, fetchCustomerCategories } from "@/lib/category"
import styles from "@/styles/my-categories.module.css"
import { Category } from "@/types/Category"
import { CategoryRequest } from "@/types/CategoryRequest"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"

export default function MyCategories() {
    const [error, setError] = useState<String>("")
    const [loading, setLoading] = useState<boolean>(false)
    const {token, logout} = useContext(AuthContext)
    const [categoryRequest, setCategoryRequest] = useState<CategoryRequest>({name: ""})
    const [categories, setCategories] = useState<Category[]>([])
    const [refresh, setRefresh] = useState<number>(0)
    const router = useRouter()

    useEffect(() => {
        setLoading(true)
        const getCustomerCategories = async () => {
            try {
                if (token) {
                    const response = await fetchCustomerCategories(token)
                    if (response.ok) {
                        const data = await response.json()
                        console.log(data)
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

    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setError("")
        const {name, value} = event.target
        setCategoryRequest(prev => ({
            ...prev,
            [name]: value
        }))
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const submitCategoryRequest = async () => {
            try {
                if (token) {
                    const response = await fetchCreateCategory(token, categoryRequest)
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
        submitCategoryRequest()
    }

    return (
        <div className="background">
            <div className="book">
                <div className="page-left"></div>
                <div className="page-right">
                    <div className="page-header">
                        <h1 className={styles.title}>Category Management</h1>
                    </div>
                    <h2 className={styles.subtitle}>ADD NEW CATEGORY</h2>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.row}>
                            <input className={styles.name} type="text" name="name" placeholder="Category Name*" value={categoryRequest.name} onChange={handleChange} disabled={loading} required></input>
                            <button className={styles.submit} type="submit" disabled={loading}>Create</button>
                        </div>
                        {error && <p>{error}</p>}
                    </form>
                    <h2 className={styles.subtitle}>VIEW CATEGORIES</h2>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr className={styles.tr}>
                                    <th className={styles.th}>Name</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                            {
                                categories.map(category => (
                                    <tr className={styles.tr} key={category.id}>
                                        <td className={styles.td}>{category.name}</td>
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