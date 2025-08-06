'use client'

import { AuthContext } from "@/context/AuthContext"
import { CategoryContext } from "@/context/CategoryContext"
import { fetchCreateCategory, fetchCustomerCategories, fetchUpdateCategory, fetchArchiveCategory } from "@/lib/category"
import styles from "@/styles/my-categories.module.css"
import { Category } from "@/types/Category"
import { CategoryRequest } from "@/types/CategoryRequest"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"

export default function MyCategories() {
    const [error, setError] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const {token, logout} = useContext(AuthContext)
    const [categoryRequest, setCategoryRequest] = useState<CategoryRequest>({name: ""})
    const router = useRouter()
    const [edit, setEdit] = useState<boolean>(false)
    const [categoryId, setCategoryId] = useState<number | null>(null)
    const {categories, refresh, loadingCategories, categoryError} = useContext(CategoryContext)

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
        submitCategoryRequest()
    }

    function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const submitEditCategoryRequest = async () => {
            const nativeEvent = event.nativeEvent as SubmitEvent;
            const submitter = nativeEvent.submitter as HTMLButtonElement;
            try {
                if (token) {
                    let response;
                    if (submitter.value === "save") {
                        response = await fetchUpdateCategory(token, categoryId!, categoryRequest)
                    } else if (submitter.value === "delete") {
                        response = await fetchArchiveCategory(token, categoryId!)
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
        submitEditCategoryRequest()
        setCategoryId(null)
        setCategoryRequest({name: ""})
        setEdit(false)
    }

    function openEdit(category: Category) {
            setEdit(true)
            setCategoryRequest({name: category.name})
            setCategoryId(category.id)
    }

    return (
        <div className="background">
            <div className="book">
                <div className="page-left">
                    <div className="page-header">
                        <h1 className="title">Category Management</h1>
                    </div>
                    { !edit && 
                        <>
                            <h2 className="subtitle">ADD NEW CATEGORY</h2>
                            <form className="form" onSubmit={handleSubmit}>
                                <div className={styles.row}>
                                    <input className={styles.name} type="text" name="name" placeholder="Category Name*" value={categoryRequest.name} onChange={handleChange} disabled={loading} required></input>
                                    <button className="submit" type="submit" disabled={loading}>Create</button>
                                </div>
                                {error && <p>{error}</p>}
                            </form>
                        </>
                    }
                    {edit && 
                        <>
                            <h2 className="subtitle">EDIT CATEGORY</h2>
                            <form className="form" onSubmit={handleEditSubmit}>
                                <div className={styles.row2}>
                                    <input className={styles.name} type="text" name="name" placeholder="Category Name*" value={categoryRequest.name} onChange={handleChange} disabled={loading} required></input>
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
                    <h2 className="subtitle">VIEW CATEGORIES</h2>
                    <div className="tableWrapper">
                        <table className="table">
                            <thead className="thead">
                                <tr className={styles.tr}>
                                    <th className="th">Name</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                            {
                                categories.map(category => (
                                    <tr className={styles.tr} key={category.id}>
                                        <td className="td">{category.name}</td>
                                        <td className="edit" onClick={() => openEdit(category)}>&#8942;</td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                        {loadingCategories && <p>Loading categories, please wait...</p>}
                        {categoryError && <p>{categoryError}</p>}
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